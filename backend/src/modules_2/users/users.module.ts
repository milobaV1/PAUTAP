import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Department } from './entities/department.entity';
import { UserSessionProgress } from '../session/entities/user-session-progress.entity';
import { TriviaParticipation } from '../trivia/entities/trivia-participation.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { EmailModule } from '../email/email.module';
import { Session } from '../session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Department,
      UserSessionProgress,
      Session,
      TriviaParticipation,
      Certificate,
    ]),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
