import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Min,
} from 'class-validator';
import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';
import { type QuestionConfig } from '../entities/training-session.entity';

export class CreateTrainingSessionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsEnum(CRISP)
  crisp_categories: CRISP;

  @IsEnum(Difficulty)
  difficulty_level: Difficulty;

  @IsObject()
  questions_config: QuestionConfig;

  @IsNumber()
  @Min(0)
  duration_minutes: number;

  @IsNotEmpty()
  @IsString()
  course_id: string;
}
