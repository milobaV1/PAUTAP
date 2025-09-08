import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Difficulty } from 'src/core/enums/question.enum';
import {
  AnswerBatch,
  ProgressState,
} from 'src/core/interfaces/session.interface';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;
}

export class StartSessionDto {
  @IsNumber()
  roleId: number;

  @IsUUID()
  userId: string;
}

export class SyncSessionDto {
  @IsUUID()
  userId: string;

  answerBatch: AnswerBatch[];

  currentState: ProgressState;
}

export class CompleteSessionDto {
  @IsUUID()
  userId: string;
}
