import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { UserSessionProgress } from '../session/entities/user-session-progress.entity';
import { Session } from '../session/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Certificate, UserSessionProgress]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
