import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CRISP } from 'src/core/enums/training.enum';
import { QuestionUsageDto } from '../question-bank/dto/question-usage.dto';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { QuestionUsage } from '../question-bank/entities/question-usage.entity';
import { Role } from '../users/entities/role.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionRoleCategoryQuestion } from './entities/session-role-category-questions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Session } from './entities/session.entity';
import {
  SessionCompletionResult,
  CompletionMetrics,
} from 'src/core/interfaces/session.interface';
import { UserAnswer } from './entities/user-answers.entity';
import { UserSessionProgress } from './entities/user-session-progress.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { type Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class SessionManagementService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private dataSource: DataSource,
  ) {}

  async createSession(createSessionDto: CreateSessionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const session = await queryRunner.manager.save(Session, createSessionDto);
      const roles = await this.roleRepo.find();

      await this.generateQuestionsForAllRoles(
        session.id,
        roles,
        queryRunner.manager,
      );

      await queryRunner.manager.update(Session, session.id, {
        questionsGenerated: true,
      });

      await queryRunner.commitTransaction();
      return session;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateQuestionsForAllRoles(
    sessionId: string,
    roles: Role[],
    manager: any,
  ): Promise<void> {
    const crispCategories: CRISP[] = [
      CRISP.C,
      CRISP.R,
      CRISP.I,
      CRISP.S,
      CRISP.P,
    ];
    const sessionRoleCategoryQuestions: Partial<SessionRoleCategoryQuestion>[] =
      [];
    const questionUsageUpdates: QuestionUsageDto[] = [];

    for (const role of roles) {
      for (const category of crispCategories) {
        const selectedQuestions = await this.selectQuestionsForRoleAndCategory(
          role.id,
          category,
          manager,
        );
        sessionRoleCategoryQuestions.push({
          sessionId,
          roleId: role.id,
          crispCategory: category,
          questionIds: selectedQuestions,
          questionsCount: selectedQuestions.length,
        });
        selectedQuestions.forEach((questionId) => {
          questionUsageUpdates.push({ questionId, roleId: role.id });
        });
      }
    }

    await manager.save(
      SessionRoleCategoryQuestion,
      sessionRoleCategoryQuestions,
    );

    await this.updateQuestionUsageBatch(
      questionUsageUpdates,
      sessionId,
      manager,
    );
  }

  private async selectQuestionsForRoleAndCategory(
    roleId: number,
    category: CRISP,
    manager: any,
  ): Promise<string[]> {
    const questions = await manager
      .createQueryBuilder(QuestionBank, 'q')
      .leftJoin('q.roles', 'qr')
      .leftJoin('q.usages', 'qu', 'qu.roleId = :roleId', { roleId })
      .select(['q.id', 'COALESCE(qu.usageCount, 0) as usageCount'])
      .where('qr.id = :roleId', { roleId })
      .andWhere('q.crispCategory = :category', { category })
      .orderBy('COALESCE(qu.usageCount, 0)', 'ASC')
      .addOrderBy('RANDOM()') // Secondary randomization
      .limit(10)
      .getRawMany();

    return questions.map((q) => q.q_id);
  }

  private async updateQuestionUsageBatch(
    updates: QuestionUsageDto[],
    sessionId: string,
    manager: any,
  ): Promise<void> {
    const usageMap = new Map<string, QuestionUsageDto>();
    updates.forEach((update) => {
      const key = `${update.questionId}-${update.roleId}`;
      usageMap.set(key, update);
    });
    const usageUpdates = Array.from(usageMap.values()).map(
      ({ questionId, roleId }) => ({
        questionId,
        roleId,
        usageCount: () => 'COALESCE(usageCount, 0) + 1',
        lastUsedAt: new Date(),
        lastUsedInSessionId: sessionId,
      }),
    );
    await manager
      .createQueryBuilder()
      .insert()
      .into(QuestionUsage)
      .values(usageUpdates)
      .orUpdate(
        ['usageCount', 'lastUsedAt', 'lastUsedInSessionId'],
        ['questionId', 'roleId'],
      )
      .execute();
  }

  // async completeSession(
  //   userId: string,
  //   sessionId: string,
  // ): Promise<SessionCompletionResult> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     // 1) Get final progress state
  //     const progress = await queryRunner.manager.findOne(UserSessionProgress, {
  //       where: { userId, sessionId },
  //       relations: ['user', 'session', 'role'],
  //     });

  //     if (!progress || progress.status !== 'completed') {
  //       throw new BadRequestException('Session not completed');
  //     }

  //     // 2) Calculate final scores and performance metrics
  //     const completionData = await this.calculateCompletionMetrics(
  //       userId,
  //       sessionId,
  //       queryRunner.manager,
  //     );

  //     // 3) Update progress with final metrics
  //     await queryRunner.manager.update(UserSessionProgress, progress.id, {
  //       completedAt: new Date(),
  //       ...completionData.finalScores,
  //     });

  //     // 4) Generate certificate/completion record
  //     const certificate = await this.generateCompletionCertificate(
  //       progress,
  //       completionData,
  //     );

  //     // 5) Trigger notifications/events
  //     //await this.triggerCompletionEvents(progress, completionData);

  //     // 6) Clean up temporary data
  //     await this.cleanupSessionData(userId, sessionId);

  //     await queryRunner.commitTransaction();

  //     return {
  //       success: true,
  //       finalScore: completionData.overallScore,
  //       categoryScores: completionData.categoryScores,
  //       certificateId: certificate,
  //       completionTime: completionData.timeSpent,
  //       rank: completionData.roleRank,
  //     };
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  private async calculateCompletionMetrics(
    userId: string,
    sessionId: string,
    manager: any,
  ): Promise<CompletionMetrics> {
    // Get all user answers for this session
    const answers = await manager
      .createQueryBuilder(UserAnswer, 'ua')
      .leftJoin('ua.sessionRoleCategoryQuestion', 'srcq')
      .leftJoin('ua.question', 'q')
      .where('ua.userId = :userId', { userId })
      .andWhere('srcq.sessionId = :sessionId', { sessionId })
      .select([
        'ua.isCorrect',
        'ua.answeredAt',
        'q.crispCategory',
        'srcq.crispCategory',
      ])
      .getRawMany();

    // Calculate category-wise scores
    const categoryScores = this.calculateCategoryScores(answers);

    // Calculate overall score
    const totalCorrect = answers.filter((a) => a.ua_isCorrect).length;
    const overallScore = (totalCorrect / answers.length) * 100;

    // Calculate time spent
    const timeSpent = this.calculateTimeSpent(answers);

    // Get user's rank among peers with same role
    const roleRank = await this.calculateRoleRank(
      userId,
      sessionId,
      overallScore,
      manager,
    );

    return {
      overallScore,
      categoryScores,
      timeSpent,
      roleRank,
      finalScores: {
        overallScore,
        ...categoryScores,
      },
    };
  }

  private calculateCategoryScores(answers: any[]): Record<string, number> {
    const categories = ['C', 'R', 'I', 'S', 'P'];
    const scores: Record<string, number> = {};

    categories.forEach((category) => {
      const categoryAnswers = answers.filter(
        (a) => a.srcq_crispCategory === category,
      );
      const correct = categoryAnswers.filter((a) => a.ua_isCorrect).length;
      scores[`${category.toLowerCase()}Score`] =
        categoryAnswers.length > 0
          ? (correct / categoryAnswers.length) * 100
          : 0;
    });

    return scores;
  }

  private calculateTimeSpent(answers: any[]): number {
    if (answers.length === 0) return 0;

    const startTime = new Date(answers[0].ua_answeredAt);
    const endTime = new Date(answers[answers.length - 1].ua_answeredAt);

    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Minutes
  }

  private async calculateRoleRank(
    userId: string,
    sessionId: string,
    userScore: number,
    manager: any,
  ): Promise<number> {
    const betterScores = await manager
      .createQueryBuilder(UserSessionProgress, 'up')
      .where('up.sessionId = :sessionId', { sessionId })
      .andWhere(
        'up.roleId = (SELECT roleId FROM user_progress WHERE userId = :userId AND sessionId = :sessionId)',
        { userId, sessionId },
      )
      .andWhere('up.status = :status', { status: 'completed' })
      .andWhere(
        '(up.correctlyAnsweredQuestions * 100.0 / up.answeredQuestions) > :userScore',
        { userScore },
      )
      .getCount();

    return betterScores + 1; // Rank (1 = best)
  }

  private async generateCompletionCertificate(
    progress: UserSessionProgress,
    metrics: CompletionMetrics,
  ): Promise<string> {
    // Generate certificate ID or URL
    const certificateId = `CERT_${progress.sessionId}_${progress.userId}_${Date.now()}`;

    // Store certificate data (could be separate table)
    await this.certificateRepo.save({
      id: certificateId,
      userId: progress.userId,
      sessionId: progress.sessionId,
      roleId: progress.roleId,
      score: metrics.overallScore,
      completedAt: new Date(),
      issuedAt: new Date(),
    });

    return certificateId;
  }

  // private async triggerCompletionEvents(
  //   progress: UserSessionProgress,
  //   metrics: CompletionMetrics
  // ): Promise<void> {
  //   // Fire async events (don't await to avoid blocking)
  //   Promise.all([
  //     this.notificationService.sendCompletionEmail(progress.userId, progress.sessionId, metrics),
  //     this.analyticsService.trackCompletion(progress, metrics),
  //     this.leaderboardService.updateRankings(progress.sessionId, progress.roleId)
  //   ]).catch(error => {
  //     this.logger.error('Completion events failed', error);
  //   });
  // }

  private async cleanupSessionData(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const patterns = [
      `session:${sessionId}:role:*:categories`,
      `user:${userId}:session:${sessionId}:*`,
    ];

    // cacheManager is a Keyv instance with multiple stores
    const keyvStores = (this.cacheManager as any).stores;

    // Find the Redis store
    const redisStore = keyvStores.find((s: any) => s instanceof KeyvRedis);
    if (!redisStore) return;

    const redisClient = redisStore.redis; // raw ioredis client

    for (const pattern of patterns) {
      const keys: string[] = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
  }
}
