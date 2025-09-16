import { Module } from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { TriviaController } from './trivia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trivia } from './entities/trivia.entity';
import { TriviaParticipation } from './entities/trivia-participation.entity';
import { TriviaAnswer } from './entities/trivia-answer';
import { TriviaLeaderboard } from './entities/trivia-leaderboard';
import { User } from '../users/entities/user.entity';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trivia,
      TriviaParticipation,
      TriviaAnswer,
      TriviaLeaderboard,
      User,
      QuestionBank,
    ]),
    BullModule.registerQueue({ name: 'email' }, { name: 'leaderboard' }),
  ],
  controllers: [TriviaController],
  providers: [TriviaService],
})
export class TriviaModule {}
