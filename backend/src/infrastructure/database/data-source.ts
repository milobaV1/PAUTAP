import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from '../../modules_2/users/entities/user.entity';
import { QuestionBank } from '../../modules_2/question-bank/entities/question-bank.entity';
import { QuestionUsage } from '../../modules_2/question-bank/entities/question-usage.entity';
import { UserQuestionHistory } from '../../modules_2/question-bank/entities/user-question-history.entity';
import { SessionRoleCategoryQuestion } from '../../modules_2/session/entities/session-role-category-questions.entity';
import { UserAnswer } from '../../modules_2/session/entities/user-answers.entity';
import { UserSessionProgress } from '../../modules_2/session/entities/user-session-progress.entity';
import { TriviaAnswer } from '../../modules_2/trivia/entities/trivia-answer';
import { TriviaLeaderboard } from '../../modules_2/trivia/entities/trivia-leaderboard';
import { TriviaParticipation } from '../../modules_2/trivia/entities/trivia-participation.entity';
import { Trivia } from '../../modules_2/trivia/entities/trivia.entity';
import { Department } from '../../modules_2/users/entities/department.entity';
import { Role } from '../../modules_2/users/entities/role.entity';
import { Certificate } from '../../modules_2/certificate/entities/certificate.entity';
import { Session } from '../../modules_2/session/entities/session.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // disable this in production
});

export default AppDataSource;
