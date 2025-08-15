import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { TrainingSession } from './entities/training-session.entity';
import { CourseContentModule } from '../course-content/course-content.module';
import { CourseContent } from '../course-content/entities/course-content.entity';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      User,
      TrainingSession,
      CourseContent,
      QuestionBank,
    ]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
