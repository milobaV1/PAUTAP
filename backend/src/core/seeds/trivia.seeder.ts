import { QuestionBank } from 'src/modules_2/question-bank/entities/question-bank.entity';
import { Trivia } from 'src/modules_2/trivia/entities/trivia.entity';
import { DataSource } from 'typeorm';
import { TriviaStatus } from '../enums/trivia.enum';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TriviaService } from 'src/modules_2/trivia/trivia.service';
import { User } from 'src/modules_2/users/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// export async function seedTrivia(dataSource: DataSource) {
//   const triviaRepository = dataSource.getRepository(Trivia);
//   const questionRepository = dataSource.getRepository(QuestionBank);

//   // Get random questions for seeding
//   const questions = await questionRepository
//     .createQueryBuilder()
//     .orderBy('RANDOM()')
//     .limit(10)
//     .getMany();

//   if (questions.length < 10) {
//     console.log('Not enough questions in database for trivia seeding');
//     return;
//   }

//   const today = new Date();
//   today.setHours(13, 40, 0, 0); // 13:40 = 1:40 PM

//   const testTrivia = triviaRepository.create({
//     title: `Test Trivia - ${today.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`,
//     description: 'Test trivia for development and testing purposes',
//     questionIds: questions.map((q) => q.id),
//     scheduledAt: today,
//     status: TriviaStatus.SCHEDULED,
//   });
//   await triviaRepository.save(testTrivia);
//   console.log('Test trivia created successfully');
// }

@Injectable()
export class TriviaSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private triviaService: TriviaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    const triviaRepository = this.dataSource.getRepository(Trivia);
    const questionRepository = this.dataSource.getRepository(QuestionBank);
    const userRepo = this.dataSource.getRepository(User);
    // Get random questions for seeding
    const questions = await questionRepository
      .createQueryBuilder()
      .orderBy('RANDOM()')
      .limit(10)
      .getMany();

    if (questions.length < 10) {
      console.log('Not enough questions in database for trivia seeding');
      return;
    }

    const today = new Date();
    today.setHours(19, 16, 0, 0); // 13:40 = 1:40 PM

    const testTrivia = triviaRepository.create({
      title: `Test Trivia - ${today.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      description: 'Test trivia for development and testing purposes',
      questionIds: questions.map((q) => q.id),
      scheduledAt: today,
      status: TriviaStatus.SCHEDULED,
    });
    await triviaRepository.save(testTrivia);
    console.log('Test trivia created successfully');
    const users = await userRepo.find();
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/trivia`;
    const jobs = users.map((user) => ({
      name: 'send trivia', // job name
      data: {
        to: user.email,
        subject: 'New Trivia',
        html: `
      <p>Hi</p>
      <p>Click here to go to the trivia page <a href="${url}">reset-password</a></p>
    `,
      },
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    }));

    await this.emailQueue.addBulk(jobs);
  }
}
