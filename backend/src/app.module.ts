import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfigAsync } from './infrastructure/database/database.config';
// import { UsersModule } from './modules/users/users.module';
// import { CourseContentModule } from './modules/course-content/course-content.module';
// import { AuthModule } from './modules/auth/auth.module';
// import { CertificateModule } from './modules/certificate/certificate.module';
// import { QuestionBankModule } from './modules/question-bank/question-bank.module';
// import { SessionModule } from './modules/session/session.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules_2/auth/guards/jwt-auth.guard';
import { AdminSeeder } from './core/seeds/admin.seeder';
import { AuthModule } from './modules_2/auth/auth.module';
import { UsersModule } from './modules_2/users/users.module';
import { QuestionBankModule } from './modules_2/question-bank/question-bank.module';
import { SessionModule } from './modules_2/session/session.module';
import { CertificateModule } from './modules_2/certificate/certificate.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { TriviaModule } from './modules_2/trivia/trivia.module';
import { TriviaSeeder } from './core/seeds/trivia.seeder';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './modules_2/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeormConfigAsync),
    // AuthModule,
    // CourseContentModule,
    // CertificateModule,
    // QuestionBankModule,
    // SessionModule,
    // UsersModule,
    AuthModule,
    CertificateModule,
    EmailModule,
    QuestionBankModule,
    SessionModule,
    UsersModule,
    TriviaModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv('redis://redis2:6379'),
          ],
        };
      },
    }),
    BullModule.forRoot({
      connection: {
        host: 'redis2', // same container name as in docker-compose
        port: 6379,
      },
    }),
    //BullModule.registerQueue({ name: 'email' }, { name: 'leaderboard' }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USERNAME'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AdminSeeder,
    //TriviaSeeder,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
