import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';

@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  create(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    return this.questionBankService.create(createQuestionBankDto);
  }

  @Get()
  findAll() {
    return this.questionBankService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionBankDto: UpdateQuestionBankDto) {
    return this.questionBankService.update(+id, updateQuestionBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(+id);
  }
}
