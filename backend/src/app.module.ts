import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfigAsync } from './infrastructure/database/database.config';
import { UsersModule } from './modules/users/users.module';
import { CourseContentModule } from './modules/course-content/course-content.module';
import { AuthModule } from './modules/auth/auth.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';
import { SessionModule } from './modules/session/session.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AdminSeeder } from './core/seeds/admin.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeormConfigAsync),
    AuthModule,
    CourseContentModule,
    CertificateModule,
    QuestionBankModule,
    SessionModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AdminSeeder,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
