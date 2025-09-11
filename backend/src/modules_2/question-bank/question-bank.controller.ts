import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @ApiOperation({ summary: 'Create a single question' })
  @ApiResponse({
    status: 201,
    description: 'The question has been successfully created.',
  })
  async create(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    return this.questionBankService.create(createQuestionBankDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk insert questions' })
  @ApiResponse({ status: 201, description: 'Questions created successfully' })
  async bulkCreate(@Body() createQuestionBankDtos: CreateQuestionBankDto[]) {
    return this.questionBankService.bulkCreate(createQuestionBankDtos);
  }

  @Get()
  findAll() {
    return this.questionBankService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionBankDto: UpdateQuestionBankDto,
  ) {
    return this.questionBankService.update(+id, updateQuestionBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }
}
