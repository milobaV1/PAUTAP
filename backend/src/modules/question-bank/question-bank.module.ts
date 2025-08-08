import { Module } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankController } from './question-bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionBank } from './entities/question-bank.entity';
import { SessionAnswer } from './entities/session-answer.entity';
import { TrainingSession } from '../session/entities/training-session.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionBank,
      SessionAnswer,
      TrainingSession,
      User,
    ]),
  ],
  controllers: [QuestionBankController],
  providers: [QuestionBankService],
})
export class QuestionBankModule {}
