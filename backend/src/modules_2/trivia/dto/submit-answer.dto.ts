import { IsUUID, IsString, IsNumber, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  participationId: string;

  @IsUUID()
  questionId: string;

  @IsString()
  selectedAnswer: number;

  @IsNumber()
  @Min(0)
  timeSpent: number;
}
