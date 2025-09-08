import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class QuestionUsageDto {
  @IsUUID()
  questionId: string;

  @IsNumber()
  roleId: number;
}
