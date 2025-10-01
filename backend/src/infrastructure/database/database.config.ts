import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Certificate } from 'src/modules_2/certificate/entities/certificate.entity';
import { QuestionBank } from 'src/modules_2/question-bank/entities/question-bank.entity';
import { QuestionUsage } from 'src/modules_2/question-bank/entities/question-usage.entity';
import { UserQuestionHistory } from 'src/modules_2/question-bank/entities/user-question-history.entity';
import { SessionRoleCategoryQuestion } from 'src/modules_2/session/entities/session-role-category-questions.entity';
import { Session } from 'src/modules_2/session/entities/session.entity';
import { UserAnswer } from 'src/modules_2/session/entities/user-answers.entity';
import { UserSessionProgress } from 'src/modules_2/session/entities/user-session-progress.entity';
import { TriviaAnswer } from 'src/modules_2/trivia/entities/trivia-answer';
import { TriviaLeaderboard } from 'src/modules_2/trivia/entities/trivia-leaderboard';
import { TriviaParticipation } from 'src/modules_2/trivia/entities/trivia-participation.entity';
import { Trivia } from 'src/modules_2/trivia/entities/trivia.entity';
import { Department } from 'src/modules_2/users/entities/department.entity';
import { Role } from 'src/modules_2/users/entities/role.entity';
import { User } from 'src/modules_2/users/entities/user.entity';

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
      Certificate,
      Department,
      QuestionBank,
      QuestionUsage,
      UserQuestionHistory,
      Session,
      SessionRoleCategoryQuestion,
      UserSessionProgress,
      UserAnswer,
      Trivia,
      TriviaAnswer,
      TriviaParticipation,
      TriviaLeaderboard,
    ],
    synchronize: true, // disable in production
    autoLoadEntities: true,
  }),
};
