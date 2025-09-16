import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTriviaDto } from './dto/create-trivia.dto';
import { UpdateTriviaDto } from './dto/update-trivia.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { User } from '../users/entities/user.entity';
import { TriviaAnswer } from './entities/trivia-answer';
import { TriviaLeaderboard } from './entities/trivia-leaderboard';
import { TriviaParticipation } from './entities/trivia-participation.entity';
import { Trivia } from './entities/trivia.entity';
import { ParticipationStatus, TriviaStatus } from 'src/core/enums/trivia.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TriviaService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('leaderboard') private readonly leaderboardQueue: Queue,
    @InjectRepository(Trivia)
    private triviaRepository: Repository<Trivia>,
    @InjectRepository(TriviaParticipation)
    private participationRepository: Repository<TriviaParticipation>,
    @InjectRepository(TriviaAnswer)
    private answerRepository: Repository<TriviaAnswer>,
    @InjectRepository(TriviaLeaderboard)
    private leaderboardRepository: Repository<TriviaLeaderboard>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
  ) {}
  create(createTriviaDto: CreateTriviaDto) {
    return 'This action adds a new trivia';
  }

  findAll() {
    return `This action returns all trivia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trivia`;
  }

  update(id: number, updateTriviaDto: UpdateTriviaDto) {
    return `This action updates a #${id} trivia`;
  }

  remove(id: number) {
    return `This action removes a #${id} trivia`;
  }

  @Cron('0 9 1 * *')
  async createMonthlyTrivia() {
    const now = new Date();
    const scheduledAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      10,
      0,
    ); // 10 AM today
    const existing = await this.triviaRepository.findOne({
      where: { scheduledAt },
    });
    if (existing) return existing;

    // Get 10 random questions
    const questions = await this.getRandomQuestions(10);

    const trivia = this.triviaRepository.create({
      title: `Monthly Trivia - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      description: 'Monthly knowledge challenge for all employees',
      questionIds: questions.map((q) => q.id),
      scheduledAt,
      status: TriviaStatus.SCHEDULED,
    });

    const savedTrivia = await this.triviaRepository.save(trivia);

    // enqueue emails — workers will handle actual sending (retries, backoff)
    await this.emailQueue.add('send-trivia-notifications', {
      triviaId: savedTrivia.id,
    });

    return savedTrivia;
  }

  // Cron job to activate scheduled trivias - runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async activateScheduledTrivias(): Promise<void> {
    const now = new Date();
    const scheduledTrivias = await this.triviaRepository.find({
      where: {
        status: TriviaStatus.SCHEDULED,
        scheduledAt: LessThan(now),
      },
    });

    for (const trivia of scheduledTrivias) {
      trivia.status = TriviaStatus.ACTIVE;
      trivia.startedAt = now;
      trivia.endedAt = new Date(now.getTime() + trivia.timeLimit * 1000);
      await this.triviaRepository.save(trivia);
    }
  }

  // Cron job to expire active trivias - runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async expireActiveTrivias(): Promise<void> {
    const now = new Date();
    const activeTrivias = await this.triviaRepository.find({
      where: {
        status: TriviaStatus.ACTIVE,
        endedAt: LessThan(now),
      },
    });

    for (const trivia of activeTrivias) {
      trivia.status = TriviaStatus.EXPIRED;
      await this.triviaRepository.save(trivia);

      // Mark all in-progress participations as expired
      await this.participationRepository.update(
        {
          triviaId: trivia.id,
          status: ParticipationStatus.IN_PROGRESS,
        },
        { status: ParticipationStatus.EXPIRED },
      );
    }

    // Update leaderboard after trivia expires
    if (activeTrivias.length > 0) {
      await this.updateLeaderboard();
    }
  }

  private async getRandomQuestions(count: number): Promise<QuestionBank[]> {
    // Get random questions from question bank
    const questions = await this.questionBankRepository
      .createQueryBuilder('question')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();

    if (questions.length < count) {
      throw new BadRequestException(
        `Not enough questions available. Required: ${count}, Available: ${questions.length}`,
      );
    }

    return questions;
  }

  async getCurrentTrivia(): Promise<Trivia | null> {
    return this.triviaRepository.findOne({
      where: {
        status: TriviaStatus.ACTIVE,
      },
      order: { scheduledAt: 'DESC' },
    });
  }

  async startTrivia(
    triviaId: string,
    userId: string,
  ): Promise<TriviaParticipation> {
    const trivia = await this.triviaRepository.findOne({
      where: { id: triviaId },
    });

    if (!trivia) {
      throw new NotFoundException('Trivia not found');
    }

    if (!trivia.canParticipate()) {
      throw new BadRequestException(
        'Trivia is not available for participation',
      );
    }

    // Check if user already participated
    const existingParticipation = await this.participationRepository.findOne({
      where: { triviaId, userId },
    });

    if (existingParticipation) {
      if (
        existingParticipation.isCompleted() ||
        existingParticipation.isExpired()
      ) {
        throw new BadRequestException('You have already completed this trivia');
      }

      // Return existing participation if in progress
      return existingParticipation;
    }

    // Create new participation
    const participation = this.participationRepository.create({
      triviaId,
      userId,
      status: ParticipationStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    return this.participationRepository.save(participation);
  }

  async submitAnswer(
    participationId: string,
    questionId: string,
    selectedAnswer: number,
    timeSpent: number,
  ): Promise<TriviaAnswer> {
    const participation = await this.participationRepository.findOne({
      where: { id: participationId },
      relations: ['trivia'],
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    if (participation.status !== ParticipationStatus.IN_PROGRESS) {
      throw new BadRequestException('Participation is not in progress');
    }

    // Check if trivia is still active
    if (!participation.trivia.canParticipate()) {
      participation.status = ParticipationStatus.EXPIRED;
      await this.participationRepository.save(participation);
      throw new BadRequestException('Trivia has expired');
    }

    // Get the question to check correct answer
    const question = await this.questionBankRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check if answer already exists
    const existingAnswer = await this.answerRepository.findOne({
      where: { participationId, questionId },
    });

    if (existingAnswer) {
      throw new BadRequestException(
        'Answer already submitted for this question',
      );
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    const answer = this.answerRepository.create({
      participationId: String(participationId),
      questionId: String(questionId),
      selectedAnswer: String(selectedAnswer),
      isCorrect,
      timeSpent,
    });

    const savedAnswer = await this.answerRepository.save(answer);

    // Update participation stats
    participation.totalAnswered += 1;
    if (isCorrect) {
      participation.correctAnswers += 1;
    }
    participation.score =
      (participation.correctAnswers / participation.totalAnswered) * 100;

    await this.participationRepository.save(participation);

    return savedAnswer;
  }

  async submitTrivia(participationId: string): Promise<TriviaParticipation> {
    const participation = await this.participationRepository.findOne({
      where: { id: participationId },
      relations: ['answers'],
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    if (participation.status !== ParticipationStatus.IN_PROGRESS) {
      throw new BadRequestException('Participation is not in progress');
    }

    // Calculate final stats
    const now = new Date();
    participation.status = ParticipationStatus.SUBMITTED;
    participation.completedAt = now;
    participation.submittedAt = now;
    participation.timeSpent = Math.floor(
      (now.getTime() - participation.startedAt.getTime()) / 1000,
    );

    return this.participationRepository.save(participation);
  }

  async getTriviaQuestions(triviaId: string): Promise<QuestionBank[]> {
    const trivia = await this.triviaRepository.findOne({
      where: { id: triviaId },
    });

    if (!trivia) {
      throw new NotFoundException('Trivia not found');
    }

    return this.questionBankRepository.find({
      where: { id: In(trivia.questionIds) },
    });
  }

  async getUserParticipation(
    triviaId: string,
    userId: string,
  ): Promise<TriviaParticipation | null> {
    return this.participationRepository.findOne({
      where: { triviaId, userId },
      relations: ['answers'],
    });
  }

  async getLeaderboard(
    month?: number,
    year?: number,
  ): Promise<TriviaLeaderboard[]> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    return this.leaderboardRepository.find({
      where: { month: targetMonth, year: targetYear },
      relations: ['user', 'user.role', 'user.role.department'],
      order: { rank: 'ASC' },
    });
  }

  private async updateLeaderboard(): Promise<void> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get all participations for the current month
    const participations = await this.participationRepository
      .createQueryBuilder('participation')
      .innerJoin('participation.trivia', 'trivia')
      .where('EXTRACT(MONTH FROM trivia.scheduledAt) = :month', {
        month: currentMonth,
      })
      .andWhere('EXTRACT(YEAR FROM trivia.scheduledAt) = :year', {
        year: currentYear,
      })
      .andWhere('participation.status IN (:...statuses)', {
        statuses: [
          ParticipationStatus.COMPLETED,
          ParticipationStatus.SUBMITTED,
        ],
      })
      .getMany();

    // Group by user
    const userStats = new Map();

    participations.forEach((participation) => {
      const userId = participation.userId;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          triviaCount: 0,
          totalScore: 0,
          bestScore: 0,
          totalCorrectAnswers: 0,
          totalQuestionsAnswered: 0,
        });
      }

      const stats = userStats.get(userId);
      stats.triviaCount += 1;
      stats.totalScore += participation.score;
      stats.bestScore = Math.max(stats.bestScore, participation.score);
      stats.totalCorrectAnswers += participation.correctAnswers;
      stats.totalQuestionsAnswered += participation.totalAnswered;
    });

    // Calculate leaderboard entries
    const leaderboardData = Array.from(userStats.entries()).map(
      ([userId, stats]) => ({
        userId,
        ...stats,
        averageScore: stats.totalScore / stats.triviaCount,
        overallAccuracy:
          (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100,
      }),
    );

    // Sort by average score descending
    leaderboardData.sort((a, b) => b.averageScore - a.averageScore);

    // Assign ranks and update database
    for (let i = 0; i < leaderboardData.length; i++) {
      const data = leaderboardData[i];

      await this.leaderboardRepository.upsert(
        {
          userId: data.userId,
          month: currentMonth,
          year: currentYear,
          triviaCount: data.triviaCount,
          totalScore: data.totalScore,
          averageScore: data.averageScore,
          bestScore: data.bestScore,
          totalCorrectAnswers: data.totalCorrectAnswers,
          totalQuestionsAnswered: data.totalQuestionsAnswered,
          overallAccuracy: data.overallAccuracy,
          rank: i + 1,
        },
        ['userId', 'month', 'year'],
      );
    }
  }
}
