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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Department,
      UserSessionProgress,
      TriviaParticipation,
      Certificate,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
