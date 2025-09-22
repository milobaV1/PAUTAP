import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
//import { Difficulty } from 'src/core/enums/question.enum';
import {
  AnswerBatch,
  type ProgressState,
} from 'src/core/interfaces/session.interface';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Title of the session',
    example: 'Introduction to Blockchain',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Optional description of the session',
    example:
      'This session covers the basics of blockchain and its applications.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Time limit for the session in minutes',
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  // @ApiProperty({
  //   description: 'Difficulty level of the session',
  //   enum: Difficulty,
  //   example: Difficulty.BEGINNER,
  // })
  // @IsEnum(Difficulty)
  // difficulty: Difficulty;
}

export class StartSessionDto {
  @ApiProperty({
    description: 'The role ID of the user starting the session',
    example: 3,
  })
  @IsNumber()
  roleId: number;

  @ApiProperty({
    description: 'The UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;
}

export class RetakeSessionDto {
  @ApiProperty({
    description: 'The UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;
}

export class SyncSessionDto {
  @ApiProperty({
    description: 'The UUID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Batch of answers submitted by the user',
    type: [Object], // replace Object with AnswerBatch if Swagger can detect it
    example: [
      { questionId: 'uuid', answer: 'A' },
      { questionId: 'uuid', answer: 'B' },
    ],
  })
  answerBatch: AnswerBatch[];

  @ApiProperty({
    description: 'Current progress state of the session',
    example: 'IN_PROGRESS',
  })
  currentState: ProgressState;

  @IsOptional()
  @IsEnum(['in_progress', 'completed', 'paused'])
  status?: string;
}

export class CompleteSessionDto {
  @ApiProperty({
    description: 'The UUID of the user completing the session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;
}
