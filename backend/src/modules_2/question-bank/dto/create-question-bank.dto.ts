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
import { ApiProperty } from '@nestjs/swagger';
//import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';

export class CreateQuestionBankDto {
  @ApiProperty({ enum: CRISP, required: false, example: CRISP.C })
  @IsEnum(CRISP)
  @IsOptional()
  crispCategory?: CRISP;

  @ApiProperty({
    example: 'Which of the following best describes community at PAU?',
  })
  @IsNotEmpty()
  @IsString()
  questionText: string;

  @ApiProperty({
    type: [String],
    example: ['Helping one another', 'Ignoring peers', 'Focusing only on self'],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'Must have at least 2 options' })
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  correctAnswer: number;

  @ApiProperty({
    example: 'Helping one another because PAU is big on service',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  // @ApiProperty({
  //   enum: Difficulty,
  //   required: false,
  //   example: Difficulty.BEGINNER,
  // })
  // @IsEnum(Difficulty)
  // @IsOptional()
  // difficultyLevel?: Difficulty;

  // @ApiProperty({
  //   type: [Number],
  //   example: [1, 2],
  //   description: 'Array of role IDs (1–10)',
  //   required: false,
  // })
  // @IsArray()
  // @ArrayMinSize(1)
  // @IsNumber({}, { each: true })
  // @IsOptional()
  // roleIds?: number[];
}
