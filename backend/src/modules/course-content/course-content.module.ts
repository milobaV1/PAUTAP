import { Module } from '@nestjs/common';
import { CourseContentService } from './course-content.service';
import { CourseContentController } from './course-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseContent } from './entities/course-content.entity';
import { ContentProgress } from './entities/content-progress.entity';
import { TrainingSession } from '../session/entities/training-session.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseContent,
      ContentProgress,
      TrainingSession,
      User,
    ]),
  ],
  controllers: [CourseContentController],
  providers: [CourseContentService],
})
export class CourseContentModule {}
