import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ContentType } from 'src/core/enums/course.enum';
import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';

export class CreateCourseContentDto {
  @IsEnum(CRISP)
  crisp_category: CRISP;

  @IsEnum(ContentType)
  content_type: ContentType;

  @IsEnum(Difficulty)
  difficulty_level: Difficulty;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNumber()
  @Min(0)
  duration_minutes: number;

  @IsOptional()
  @IsBoolean()
  is_required: boolean;
}
