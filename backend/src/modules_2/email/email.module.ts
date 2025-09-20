import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from 'src/infrastructure/workers/email.worker';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' })],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService, BullModule],
})
export class EmailModule {}
