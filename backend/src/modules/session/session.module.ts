import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { TrainingSession } from './entities/training-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User, TrainingSession])],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
