import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionBankDto } from './create-question-bank.dto';
import { IsArray, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateQuestionBankDto extends PartialType(CreateQuestionBankDto) {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @ArrayMinSize(2)
  options?: string[];
}
