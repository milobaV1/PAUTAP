import { IsUUID } from 'class-validator';

export class StartTriviaDto {
  @IsUUID()
  triviaId: string;

  @IsUUID()
  userId: string;
}
