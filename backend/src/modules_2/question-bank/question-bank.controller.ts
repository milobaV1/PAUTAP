import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionBankDto } from './dto/create-question-bank.dto';
import { UpdateQuestionBankDto } from './dto/update-question-bank.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminQuestionsResponse } from 'src/core/interfaces/question.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SystemAdminOnly } from 'src/core/metadata/role.metadata';
import { SkipThrottle } from '@nestjs/throttler';

@ApiBearerAuth('access-token')
@Controller('question-bank')
@UseGuards(RolesGuard)
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @SystemAdminOnly()
  @Post()
  @ApiOperation({ summary: 'Create a single question' })
  @ApiResponse({
    status: 201,
    description: 'The question has been successfully created.',
  })
  async create(@Body() createQuestionBankDto: CreateQuestionBankDto) {
    return this.questionBankService.create(createQuestionBankDto);
  }

  @SystemAdminOnly()
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

  @SystemAdminOnly()
  @SkipThrottle()
  @Get('admin')
  @ApiOperation({ summary: 'Get paginated list of admin questions' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    example: 1,
    description: 'Page number for pagination (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    example: 5,
    description: 'Number of items per page (default: 5)',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search term to filter questions by text',
  })
  async getAdminQuestions(
    @Query('page') page = '1',
    @Query('limit') limit = '5',
    @Query('search') search = '',
  ): Promise<AdminQuestionsResponse> {
    return this.questionBankService.getAdminQuestions(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionBankService.findOne(id);
  }

  @SystemAdminOnly()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionBankDto: UpdateQuestionBankDto,
  ) {
    return this.questionBankService.update(id, updateQuestionBankDto);
  }

  @SystemAdminOnly()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionBankService.remove(id);
  }
}
