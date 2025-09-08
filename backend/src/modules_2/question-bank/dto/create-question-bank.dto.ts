import {
  IsString,
  IsArray,
  ArrayMinSize,
  IsInt,
  Min,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';

export class CreateQuestionBankDto {
  @IsEnum(CRISP)
  crisp_category?: CRISP;

  @IsNotEmpty()
  @IsString()
  question_text: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Must have at least 2 options' })
  @IsString({ each: true })
  options: string[];

  @IsInt()
  @Min(0)
  correct_answer: number;

  @IsEnum(Difficulty)
  difficulty_level?: Difficulty;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  role_ids?: number[];
}
