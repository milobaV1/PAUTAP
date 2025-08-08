import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';
import { ContentProgress } from 'src/modules/course-content/entities/content-progress.entity';
import { CourseContent } from 'src/modules/course-content/entities/course-content.entity';
import { QuestionBank } from 'src/modules/question-bank/entities/question-bank.entity';
import { SessionAnswer } from 'src/modules/question-bank/entities/session-answer.entity';
import { UserQuestionHistory } from 'src/modules/question-bank/entities/user-question-history.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import { TrainingSession } from 'src/modules/session/entities/training-session.entity';
import { Department } from 'src/modules/users/entities/department.entity';
import { Role } from 'src/modules/users/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';

export const typeormConfigAsync = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [
      User,
      Role,
      Department,
      Session,
      Certificate,
      CourseContent,
      ContentProgress,
      QuestionBank,
      SessionAnswer,
      UserQuestionHistory,
      TrainingSession,
    ],
    synchronize: true, // disable in production
    autoLoadEntities: true,
  }),
};
