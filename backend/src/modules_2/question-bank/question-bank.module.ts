import { Module } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankController } from './question-bank.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionBank } from './entities/question-bank.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { QuestionUsage } from './entities/question-usage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionBank,
      // SessionAnswer,
      // TrainingSession,
      Role,
      User,
      QuestionUsage,
    ]),
  ],
  controllers: [QuestionBankController],
  providers: [QuestionBankService],
})
export class QuestionBankModule {}
