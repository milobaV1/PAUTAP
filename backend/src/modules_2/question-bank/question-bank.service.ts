import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionBank } from './entities/question-bank.entity';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { Role } from '../users/entities/role.entity';
import { QuestionUsage } from './entities/question-usage.entity';
import {
  AdminQuestionsResponse,
  QuestionWithUsageDto,
} from 'src/core/interfaces/question.interface';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(QuestionBank)
    private questionRepo: Repository<QuestionBank>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(QuestionUsage)
    private readonly questionUsageRepo: Repository<QuestionUsage>,
    private dataSource: DataSource,
  ) {}
  async create(createQuestionBankDto: CreateQuestionBankDto) {
    const question = this.questionRepo.create(createQuestionBankDto);

    return await this.questionRepo.save(question);
  }

  async bulkCreate(createQuestionBankDtos: CreateQuestionBankDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const questionsToSave: QuestionBank[] = [];

      for (const dto of createQuestionBankDtos) {
        const question = queryRunner.manager
          .getRepository(this.questionRepo.target)
          .create(dto);

        questionsToSave.push(question);
      }

      const savedQuestions = await queryRunner.manager
        .getRepository(this.questionRepo.target)
        .save(questionsToSave);

      await queryRunner.commitTransaction();
      return savedQuestions;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const question = await this.questionRepo.find({
      relations: ['usages'],
    });

    return question;
  }

  async findOne(id: string): Promise<QuestionBank> {
    console.log('=== FINDING QUESTION ===');
    console.log('Question ID:', id);

    const question = await this.questionRepo
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.usages', 'usage')
      .where('question.id = :id', { id })
      .getOne();

    console.log('Question found:', !!question);

    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(id: string, updateQuestionBankDto: UpdateQuestionBankDto) {
    console.log('=== UPDATE QUESTION ===');
    console.log('Update data:', updateQuestionBankDto);
    const question = await this.findOne(id);
    if (!question) throw new NotFoundException('Question not found');

    // Handle regular fields
    Object.assign(question, updateQuestionBankDto);

    await this.questionRepo.save(question);
    return this.findOne(id);
  }

  async remove(id: string) {
    const question = await this.findOne(id);
    if (!question) throw new BadRequestException('Question not found');

    await this.questionRepo.delete(id);
    return `Question ${id} deleted`;
  }

  async getAdminQuestions(
    page = 1,
    limit = 5,
    search = '',
  ): Promise<AdminQuestionsResponse> {
    console.log('SERVICE CALLED with', { page, limit });

    const whereClause = search
      ? { questionText: ILike(`%${search}%`) } // <-- case-insensitive partial match
      : {};
    const [questions, totalQuestions] = await this.questionRepo.findAndCount({
      where: whereClause,
      relations: ['usages'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    console.log('questions:', questions, 'totalQuestions:', totalQuestions);

    // total usage across all questions
    const totalUsage = await this.questionUsageRepo
      .createQueryBuilder('usage')
      .select('SUM(usage.usageCount)', 'totalUsage')
      .getRawOne<{ totalUsage: string }>();

    const shapedQuestions: QuestionWithUsageDto[] = questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      usage: q.usages?.reduce((sum, u) => sum + u.usageCount, 0) || 0,
    }));

    return {
      totalQuestions,
      totalUsage: Number(totalUsage?.totalUsage) || 0,
      questions: shapedQuestions,
      page,
      limit,
    };
  }
}
