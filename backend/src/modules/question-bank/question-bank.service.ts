import { Injectable } from '@nestjs/common';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Injectable()
export class QuestionBankService {
  create(createQuestionBankDto: CreateQuestionBankDto) {
    return 'This action adds a new questionBank';
  }

  findAll() {
    return `This action returns all questionBank`;
  }

  findOne(id: number) {
    return `This action returns a #${id} questionBank`;
  }

  update(id: number, updateQuestionBankDto: UpdateQuestionBankDto) {
    return `This action updates a #${id} questionBank`;
  }

  remove(id: number) {
    return `This action removes a #${id} questionBank`;
  }
}
