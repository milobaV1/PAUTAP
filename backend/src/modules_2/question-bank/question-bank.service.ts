import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionBank } from './entities/question-bank.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Role } from '../users/entities/role.entity';

@Injectable()
export class QuestionBankService {
  constructor(
    @InjectRepository(QuestionBank)
    private questionRepo: Repository<QuestionBank>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private dataSource: DataSource,
  ) {}
  async create(createQuestionBankDto: CreateQuestionBankDto) {
    const { roleIds, ...rest } = createQuestionBankDto;
    let roles: Role[] = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleRepo.find({
        where: {
          id: In(roleIds),
        },
      });

      // This is to validate that all requested roles were found
      if (roles.length !== roleIds.length) {
        const foundRoleIds = roles.map((role) => role.id);
        const missingRoleIds = roleIds.filter(
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

  async bulkCreate(createQuestionBankDtos: CreateQuestionBankDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const questionsToSave: QuestionBank[] = [];

      for (const dto of createQuestionBankDtos) {
        const { roleIds, ...rest } = dto;
        let roles: Role[] = [];

        if (roleIds && roleIds.length > 0) {
          roles = await queryRunner.manager.getRepository(Role).find({
            where: { id: In(roleIds) },
          });

          // validate role IDs
          if (roles.length !== roleIds.length) {
            const foundRoleIds = roles.map((role) => role.id);
            const missingRoleIds = roleIds.filter(
              (id) => !foundRoleIds.includes(id),
            );
            throw new BadRequestException(
              `Roles with IDs [${missingRoleIds.join(', ')}] not found`,
            );
          }
        }

        const question = queryRunner.manager
          .getRepository(this.questionRepo.target)
          .create({
            ...rest,
            roles,
          });

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
