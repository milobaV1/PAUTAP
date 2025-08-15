import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateSessionDto {
  @IsDate()
  expires_at: Date;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  training_session_id: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  question_ids: string[];
}
