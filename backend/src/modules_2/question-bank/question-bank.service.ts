import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionBank } from './entities/question-bank.entity';
import { In, Repository } from 'typeorm';
import { Role } from '../users/entities/role.entity';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(QuestionBank)
    private questionRepo: Repository<QuestionBank>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}
  async create(createQuestionBankDto: CreateQuestionBankDto) {
    const { role_ids, ...rest } = createQuestionBankDto;
    let roles: Role[] = [];
    if (role_ids && role_ids.length > 0) {
      roles = await this.roleRepo.find({
        where: {
          id: In(role_ids),
        },
      });

      // This is to validate that all requested roles were found
      if (roles.length !== role_ids.length) {
        const foundRoleIds = roles.map((role) => role.id);
        const missingRoleIds = role_ids.filter(
          (id) => !foundRoleIds.includes(id),
        );
        throw new BadRequestException(
          `Roles with IDs [${missingRoleIds.join(', ')}] not found`,
        );
      }
    }

    //const question = this.questionRepo.create(createQuestionBankDto);
    const question = this.questionRepo.create({
      ...rest,
      roles: roles,
    });

    return await this.questionRepo.save(question);
  }

  async findAll() {
    const question = await this.questionRepo.find({
      relations: ['question_history', 'roles'],
    });
  }

  async findOne(id: string) {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['question_history', 'roles'],
    });

    return question;
  }

  update(id: number, updateQuestionBankDto: UpdateQuestionBankDto) {
    return `This action updates a #${id} questionBank`;
  }

  async remove(id: string) {
    const question = await this.findOne(id);
    if (!question) throw new BadRequestException('Question not found');

    await this.questionRepo.delete(id);
    return `Question ${id} deleted`;
  }
}
