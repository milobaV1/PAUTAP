import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CompleteSessionDto,
  CreateSessionDto,
  RetakeSessionDto,
  StartSessionDto,
  SyncSessionDto,
} from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { DataSource, In, Repository } from 'typeorm';
import { SessionRoleCategoryQuestion } from './entities/session-role-category-questions.entity';
import { UserAnswer } from './entities/user-answers.entity';
import { UserSessionProgress } from './entities/user-session-progress.entity';
import { QuestionUsage } from '../question-bank/entities/question-usage.entity';
import { Role } from '../users/entities/role.entity';
import { CRISP } from 'src/core/enums/training.enum';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { QuestionUsageDto } from '../question-bank/dto/question-usage.dto';
import { User } from '../users/entities/user.entity';
import { ProgressStatus } from 'src/core/enums/user.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import {
  SessionCompletionResult,
  CompletionMetrics,
  AnswerBatch,
  ProgressState,
  SyncResult,
  ProgressSummary,
  ValidatedAnswer,
  AdminSessionsResponse,
  AdminSessionSummary,
} from 'src/core/interfaces/session.interface';
import KeyvRedis from '@keyv/redis';
import { Certificate } from '../certificate/entities/certificate.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SessionService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('certificate') private readonly certificateQueue: Queue,
    @InjectRepository(Certificate)
    private certificateRepo: Repository<Certificate>,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    @InjectRepository(SessionRoleCategoryQuestion)
    private sessionRoleCategoryRepo: Repository<SessionRoleCategoryQuestion>,
    @InjectRepository(UserAnswer)
    private userAnswerRepo: Repository<UserAnswer>,
    @InjectRepository(UserSessionProgress)
    private userSessionProgressRepo: Repository<UserSessionProgress>,
    @InjectRepository(QuestionBank)
    private questionRepo: Repository<QuestionBank>,
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

  async findAllSessions() {
    const sessions = await this.sessionRepo.find({
      relations: ['roleCategoryQuestions'],
    });
    return sessions;
  }

  async findAllIncompleteSessions(userId: string) {
    // Get all completed sessions for a user
    const completedSessions = await this.sessionRepo
      .createQueryBuilder('session')
      .innerJoin('session.userProgress', 'progress')
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.status = :status', {
        status: ProgressStatus.COMPLETED,
      })
      .getMany();

    return completedSessions;
  }

  async getUserSessionWithStatuses(userId: string, userRoleId: number) {
    const sessionsWithProgress = await this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect(
        'session.userProgress',
        'progress',
        'progress.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('progress.role', 'role')
      .leftJoinAndSelect(
        // Just JOIN, don't SELECT questions/answers
        'session.roleCategoryQuestions',
        'roleCategoryQuestions',
        'roleCategoryQuestions.roleId = :roleId',
        { roleId: userRoleId },
      )
      .where('session.isActive = :isActive', { isActive: true })
      .orderBy('session.createdAt', 'DESC')
      .getMany();

    console.log('This is the session with progress: ', sessionsWithProgress);

    return sessionsWithProgress.map((session) => {
      const progress = session.userProgress?.[0];

      // Count questions without loading them
      const totalQuestionsAvailable =
        session.roleCategoryQuestions?.reduce(
          (sum, rcq) => sum + rcq.questionsCount,
          0,
        ) || 0;

      console.log(
        'This is the Total question count: ',
        totalQuestionsAvailable,
      );

      return {
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDescription: session.description,
        //sessionDifficulty: session.difficulty,
        sessionCreatedAt: session.createdAt,
        questionsGenerated: session.questionsGenerated,

        // Progress data - null if user hasn't started
        status: progress?.status || ProgressStatus.NOT_STARTED,
        progressPercentage: progress?.getProgressPercentage() || 0,
        accuracyPercentage: progress?.getAccuracyPercentage() || 0,

        // Timestamps
        startedAt: progress?.startedAt || null,
        lastActiveAt: progress?.lastActiveAt || null,
        completedAt: progress?.completedAt || null,

        // Counts only - NO question data
        totalQuestionsAvailable,
        answeredQuestions: progress?.answeredQuestions || 0,
        correctlyAnsweredQuestions: progress?.correctlyAnsweredQuestions || 0,

        // Helper flags
        isStarted: !!progress,
        isCompleted: progress?.isCompleted() || false,
        canStart: session.questionsGenerated && session.isActive,
      };
    });
  }
  async findOneSession(id: string) {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['roleCategoryQuestions'],
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findOneSessionWithUserSessionProgress(
    sessionId: string,
    userId: string,
  ) {
    const session = await this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect(
        'session.UserSessionProgress',
        'UserSessionProgress',
        'UserSessionProgress.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect(
        'session.roleCategoryQuestions',
        'roleCategoryQuestions',
      )
      .where('session.id = :sessionId', { sessionId })
      .getOne();

    if (!session) throw new NotFoundException('Session not found');

    const UserSessionProgressOne = session.userProgress?.[0] || null;

    return {
      ...session,
      UserSessionProgress: undefined,
      UserSessionProgressOne,
    };
  }

  async startOrResumeSession(
    sessionId: string,
    startSessionDto: StartSessionDto,
  ) {
    const { userId, roleId } = startSessionDto;
    // ... existing code until return statement
    const session = await this.getSession(sessionId);

    console.log('Session from start or resume session', session);

    // 2) Load role categories (cached if possible)
    const roleCategories = await this.getCategoriesCached(sessionId, roleId);

    // 3) Ensure or create progress
    let progress = await this.getOrCreateProgress(
      sessionId,
      roleId,
      userId,
      roleCategories,
    );
    console.log('Progress created: from start or resume session ', progress);

    if (!progress) throw new Error('No progress');

    // // 4) Load user answers for these categories
    // const existingAnswers = await this.getUserAnswers(userId, roleCategories);

    // // 5) Build snapshot (answered/remaining)
    // const byCategory = this.buildCategorySnapshot(
    //   roleCategories,
    //   existingAnswers,
    // );

    const categories = await Promise.all(
      (roleCategories || []).map(async (rcq) => {
        const questions = await this.questionRepo.find({
          where: { id: In(rcq.questionIds) },
        });

        const sanitizedQuestions = questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options,
          category: q.crispCategory,
          //difficulty: q.difficultyLevel,
          // Don't include correctAnswer in response
        }));

        return {
          categoryId: rcq.id,
          category: rcq.crispCategory,
          questionsCount: rcq.questionsCount,
          questionIds: rcq.questionIds,
          questions: sanitizedQuestions,
          userAnswers: rcq.userAnswers || [],
        };
      }),
    );

    // 6) Update progress (status, part, scores)
    //this.updateProgressFromSnapshot(progress, byCategory);
    //await this.userSessionProgressRepo.save(progress);
    // 7) Return data needed for frontend store initialization
    return {
      session,
      progress,
      //questionsByCategory: this.formatQuestionsForFrontend(byCategory),
      categories,
      syncInterval: 180000, // 3 minutes in ms
      autoSyncTriggers: ['categoryComplete', 'timeInterval', 'pageHide'],
    };
  }
  async update(id: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.findOne(id);
    if (!session) throw new NotFoundException('Session not found');
    Object.assign(session, updateSessionDto);
    await this.sessionRepo.save(session);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    await this.sessionRepo.remove(session);
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
      .limit(5)
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
      if (update.questionId && update.roleId) {
        const key = `${update.questionId}-${update.roleId}`;
        usageMap.set(key, update);
      }
    });

    const usageUpdates = Array.from(usageMap.values()).map(
      ({ questionId, roleId }) => ({
        questionId,
        roleId,
        usageCount: 1, // Set default value for new rows
        lastUsedAt: new Date(),
        lastUsedInSessionId: sessionId,
      }),
    );

    if (usageUpdates.length > 0) {
      await manager
        .createQueryBuilder()
        .insert()
        .into('question_usage')
        .values(usageUpdates)
        .orUpdate(
          ['usageCount', 'lastUsedAt', 'lastUsedInSessionId', 'updatedAt'],
          ['questionId', 'roleId'],
          {
            skipUpdateIfNoValuesChanged: true,
            upsertType: 'on-conflict-do-update',
            rawUpdateValues: {
              usageCount: 'COALESCE(question_usage."usageCount", 0) + 1',
              updatedAt: 'DEFAULT',
            },
          },
        )
        .execute();
    }
  }

  private async getSession(sessionId: string): Promise<Session> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  private async getOrCreateProgress(
    sessionId: string,
    roleId: number,
    userId: string,
    roleCategories: SessionRoleCategoryQuestion[],
  ) {
    let progress = await this.userSessionProgressRepo.findOne({
      where: { user: { id: userId }, session: { id: sessionId } },
      relations: ['user', 'session', 'role'],
    });

    if (!progress) {
      const totalQuestionsAvailable =
        roleCategories?.reduce((sum, rcq) => sum + rcq.questionsCount, 0) || 0;

      console.log(
        'This is the Total question count: ',
        totalQuestionsAvailable,
      );
      progress = this.userSessionProgressRepo.create({
        userId,
        sessionId,
        roleId,
        status: ProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        lastActiveAt: new Date(),
        currentCategory: CRISP.C,
        currentQuestionIndex: 0,
        totalQuestions: totalQuestionsAvailable,
      });
      console.log('Progress created: ', progress);
      return this.userSessionProgressRepo.save(progress);
    }
    // progress.lastActiveAt = new Date();
    if (!progress.role || progress.role.id !== roleId)
      throw new Error('Role must match'); //Not sure which

    return progress;
  }

  private async getCategoriesCached(sessionId: string, roleId: number) {
    const cacheKey = `session:${sessionId}:role:${roleId}:categories`;

    //Try reading from the cache first
    const cached =
      await this.cacheManager.get<SessionRoleCategoryQuestion[]>(cacheKey);
    if (cached) return cached;

    //If there is nothing in the cache, get from the db
    const roleCategories = await this.sessionRoleCategoryRepo.find({
      where: { sessionId, roleId },
    });
    if (!roleCategories.length)
      throw new NotFoundException('No questions for this session + role');

    //Save the result in the cache
    await this.cacheManager.set(cacheKey, roleCategories);

    return roleCategories;
  }

  private async getUserAnswers(
    userId: string,
    roleCategories: SessionRoleCategoryQuestion[],
  ) {
    const rcIds = roleCategories.map((rc) => rc.id);
    return this.userAnswerRepo.find({
      where: {
        user: { id: userId },
        sessionRoleCategoryQuestion: { id: In(rcIds) },
      },
      relations: ['question', 'sessionRoleCategoryQuestion'],
    });
  }

  private buildCategorySnapshot(
    roleCategories: SessionRoleCategoryQuestion[],
    answers: UserAnswer[],
  ) {
    const answersByRcId = new Map<number, UserAnswer[]>();
    for (const ans of answers) {
      const list = answersByRcId.get(ans.sessionRoleCategoryQuestion.id) || [];
      list.push(ans);
      answersByRcId.set(ans.sessionRoleCategoryQuestion.id, list);
    }

    return roleCategories.map((rc) => {
      const answeredForRc = answersByRcId.get(rc.id) || [];
      const answeredIds = answeredForRc.map((a) => String(a.question.id));

      const requiredIds = rc.questionIds.slice(0, rc.questionsCount);
      const remainingIds = requiredIds.filter(
        (qid) => !answeredIds.includes(qid),
      );
      const correctCount = answeredForRc.filter((a) => a.isCorrect).length;

      return {
        rc,
        category: rc.crispCategory,
        requiredIds,
        answeredIds,
        remainingIds,
        correctlyAnsweredCount: correctCount,
      };
    });
  }

  // private updateProgressFromSnapshot(
  //   progress: UserSessionProgress,
  //   snapshot: any[],
  // ) {
  //   const totalRequired = snapshot.reduce(
  //     (sum, c) => sum + c.requiredIds.length,
  //     0,
  //   );
  //   const totalAnswered = snapshot.reduce(
  //     (sum, c) => sum + c.answeredIds.length,
  //     0,
  //   );
  //   const totalCorrect = snapshot.reduce(
  //     (sum, c) => sum + c.correctlyAnsweredCount,
  //     0,
  //   );

  //   progress.totalQuestions = totalRequired;
  //   progress.answeredQuestions = totalAnswered;
  //   progress.correctlyAnsweredQuestions = totalCorrect;

  //   const next = snapshot.find((c) => c.remainingIds.length > 0);
  //   if (next) {
  //     progress.currentCategory = next.category as CRISP;
  //     progress.currentQuestionIndex = next.requiredIds.indexOf(
  //       next.remainingIds[0],
  //     );
  //     progress.status = ProgressStatus.IN_PROGRESS;
  //   } else {
  //     progress.currentCategory = undefined;
  //     progress.currentQuestionIndex = 0;
  //     progress.status = ProgressStatus.COMPLETED;
  //     progress.completedAt = new Date();
  //   }
  // }

  private formatResult(
    session: Session,
    progress: UserSessionProgress,
    snapshot: any[],
  ) {
    const questionsByCategory = snapshot.map((c) => ({
      category: c.category,
      answered: c.answeredIds,
      remaining: c.remainingIds,
      requiredCount: c.requiredIds.length,
    }));

    return { session, progress, questionsByCategory };
  }

  async completeSession(
    sessionId: string,
    completeSessionDto: CompleteSessionDto,
  ): Promise<SessionCompletionResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { userId } = completeSessionDto;

    try {
      // 1) Get final progress state
      const progress = await queryRunner.manager.findOne(UserSessionProgress, {
        where: { userId, sessionId },
        relations: ['user', 'session', 'role'],
      });

      if (!progress || progress.status !== 'completed') {
        throw new BadRequestException('Session not completed');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      const session = await queryRunner.manager.findOne(Session, {
        where: { id: sessionId },
      });

      // 2) Calculate final scores and performance metrics
      const completionData = await this.calculateCompletionMetrics(
        userId,
        sessionId,
        queryRunner.manager,
      );

      // 3) Update progress with final metrics
      await queryRunner.manager.update(UserSessionProgress, progress.id, {
        completedAt: new Date(),
        overallScore: completionData.overallScore,
        categoryScores: completionData.categoryScores,
      });

      // 4) Generate certificate/completion record
      // const certificate = await this.generateCompletionCertificate(
      //   progress,
      //   completionData,
      // );
      // const certificateId = `CERT_${progress.sessionId}_${progress.userId}_${Date.now()}`;
      // await this.certificateQueue.add('generate', {
      //   certificateId,
      //   userId: progress.userId,
      //   sessionId: progress.sessionId,
      //   roleId: progress.roleId,
      //   score: completionData.overallScore,
      // });

      const passingScore = 80;
      const isEligibleForCertificate =
        completionData.overallScore >= passingScore;

      let certificateInfo: {
        certificateId: string;
        willBeGenerated: boolean;
        passingScore: number;
      } | null = null;

      if (isEligibleForCertificate) {
        const certificateId = `CERT_${progress.sessionId}_${progress.userId}_${Date.now()}`;

        // Queue certificate generation only if eligible
        await this.certificateQueue.add(
          'generate',
          {
            certificateId,
            user,
            sessionId: progress.sessionId,
            roleId: progress.roleId,
            score: completionData.overallScore,
            completionData, // Pass the full completion data
          },
          {
            // Queue options
            attempts: 3, // Retry up to 3 times on failure
            backoff: {
              type: 'exponential',
              delay: 5000, // Start with 5 second delay
            },
            removeOnComplete: 10, // Keep only 10 completed jobs
            removeOnFail: 5, // Keep only 5 failed jobs for debugging
          },
        );

        certificateInfo = {
          certificateId,
          willBeGenerated: true,
          passingScore,
        };
      }

      // 5) Trigger notifications/events
      // await this.triggerCompletionEvents(progress, completionData);

      // 6) Clean up temporary data
      await this.cleanupSessionData(userId, sessionId);

      await queryRunner.commitTransaction();

      return {
        success: true,
        sessionTitle: session?.title ?? '',
        finalScore: completionData.overallScore,
        categoryScores: completionData.categoryScores,
        certificateId: certificateInfo?.certificateId ?? '',
        completionTime: completionData.timeSpent,
        rank: completionData.roleRank,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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
    const categories = [CRISP.C, CRISP.R, CRISP.I, CRISP.S, CRISP.P];
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
        `up."roleId" = (
     SELECT "roleId"
     FROM user_session_progress
     WHERE "userId" = :userId AND "sessionId" = :sessionId
   )`,
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

  private formatQuestionsForFrontend(snapshot: any[]) {
    return snapshot.map((categoryData) => ({
      categoryId: categoryData.id,
      category: categoryData.category,
      questions: categoryData.rc.questionIds.map((qId, index) => ({
        id: qId,
        order: index,
        isAnswered: categoryData.answeredIds.includes(String(qId)),
      })),
      totalQuestions: categoryData.requiredIds.length,
      answeredCount: categoryData.answeredIds.length,
    }));
  }

  async syncUserProgress(
    sessionId: string,
    syncSessionDto: SyncSessionDto,
  ): Promise<SyncResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { userId, answerBatch, currentState, status } = syncSessionDto;

    try {
      // 1) Get current progress
      const progress = await queryRunner.manager.findOne(UserSessionProgress, {
        where: { userId, sessionId },
        relations: ['role'],
      });

      console.log('This is the progress before syncing: ', progress);

      if (!progress) {
        throw new NotFoundException('User progress not found');
      }

      // 2) Validate and process answer batch
      const validatedAnswers = await this.validateAnswerBatch(
        answerBatch,
        progress,
        queryRunner.manager,
      );

      console.log('Validated Answers: ', validatedAnswers);

      // 3) Save new answers (avoid duplicates)
      await this.saveAnswerBatch(validatedAnswers, queryRunner.manager);

      // 4) Determine final status
      let finalStatus = status || currentState.status || progress.status;

      // If status is 'completed', check if all questions are actually answered
      if (finalStatus === 'completed') {
        const isActuallyComplete = await this.verifySessionCompletion(
          userId,
          sessionId,
          queryRunner.manager,
        );

        if (!isActuallyComplete) {
          console.warn(
            'Session marked as completed but not all questions answered',
          );
          finalStatus = 'in_progress';
        }
      }

      // 5) Update progress state
      const updateData: any = {
        currentCategory:
          currentState.currentCategory ?? progress.currentCategory,
        currentQuestionIndex: currentState.currentQuestionIndex,
        answeredQuestions: progress.answeredQuestions + validatedAnswers.length,
        correctlyAnsweredQuestions:
          progress.correctlyAnsweredQuestions +
          validatedAnswers.filter((a) => a.isCorrect).length,
        lastActiveAt: new Date(),
        status: finalStatus,
      };

      // Add completion timestamp if status is completed
      if (finalStatus === 'completed' && progress.status !== 'completed') {
        updateData.completedAt = new Date();
      }

      await queryRunner.manager.update(
        UserSessionProgress,
        progress.id,
        updateData,
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        syncedAnswers: validatedAnswers.length,
        currentProgress: await this.getProgressSummary(userId, sessionId),
        nextSyncRecommended: this.calculateNextSyncTime(
          validatedAnswers.length,
        ),
        statusUpdated: finalStatus !== progress.status,
        newStatus: finalStatus,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Add this method to verify session completion
  private async verifySessionCompletion(
    userId: string,
    sessionId: string,
    manager: any,
  ): Promise<boolean> {
    // Get total questions assigned to this user for this session
    const totalQuestionsQuery = await manager
      .createQueryBuilder(SessionRoleCategoryQuestion, 'srcq')
      .innerJoin(
        UserSessionProgress,
        'usp',
        'usp.roleId = srcq.roleId AND usp.sessionId = srcq.sessionId',
      )
      .where('usp.userId = :userId', { userId })
      .andWhere('usp.sessionId = :sessionId', { sessionId })
      .getMany();

    // Count total questions across all categories
    const totalQuestions = totalQuestionsQuery.reduce(
      (sum, category) => sum + (category.questionIds?.length || 0),
      0,
    );

    // Get count of answered questions
    const answeredCount = await manager
      .createQueryBuilder(UserAnswer, 'ua')
      .innerJoin(
        SessionRoleCategoryQuestion,
        'srcq',
        'ua.sessionRoleCategoryQuestionId = srcq.id',
      )
      .innerJoin(
        UserSessionProgress,
        'usp',
        'usp.roleId = srcq.roleId AND usp.sessionId = srcq.sessionId',
      )
      .where('ua.userId = :userId', { userId })
      .andWhere('usp.sessionId = :sessionId', { sessionId })
      .getCount();

    console.log(
      `Session completion check - Total: ${totalQuestions}, Answered: ${answeredCount}`,
    );

    return answeredCount >= totalQuestions && totalQuestions > 0;
  }

  // Add this new method for status-only updates
  async updateSessionStatus(
    sessionId: string,
    userId: string,
    status: string,
  ): Promise<{
    success: boolean;
    newStatus: string;
    currentProgress: ProgressSummary;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get current progress
      const progress = await queryRunner.manager.findOne(UserSessionProgress, {
        where: { userId, sessionId },
      });

      if (!progress) {
        throw new NotFoundException('User progress not found');
      }

      // Verify completion if status is 'completed'
      let finalStatus = status;
      if (status === 'completed') {
        const isActuallyComplete = await this.verifySessionCompletion(
          userId,
          sessionId,
          queryRunner.manager,
        );

        if (!isActuallyComplete) {
          console.warn(
            'Attempted to mark session as completed but not all questions answered',
          );
          finalStatus = 'in_progress';
        }
      }

      // Update status
      const updateData: any = {
        status: finalStatus,
        lastActiveAt: new Date(),
      };

      // Add completion timestamp if newly completed
      if (finalStatus === 'completed' && progress.status !== 'completed') {
        updateData.completedAt = new Date();
      }

      await queryRunner.manager.update(
        UserSessionProgress,
        progress.id,
        updateData,
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        newStatus: finalStatus,
        currentProgress: await this.getProgressSummary(userId, sessionId),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  private async validateAnswerBatch(
    answerBatch: AnswerBatch[],
    progress: UserSessionProgress,
    manager: any,
  ): Promise<ValidatedAnswer[]> {
    console.log('Answer Batch received for validating: ', answerBatch);
    console.log('Progress received for validating: ', progress);
    const validated: ValidatedAnswer[] = [];

    // Get existing answers to avoid duplicates

    const existingAnswers = await manager.find(UserAnswer, {
      where: {
        user: { id: progress.userId },
        sessionRoleCategoryQuestion: { sessionId: progress.sessionId },
      },
      select: ['question'],
    });

    console.log('existing Answers: ', existingAnswers);
    const existingQuestionIds = new Set(
      existingAnswers.map((a) => a.questionId),
    );

    console.log('existing questions ids: ', existingQuestionIds);

    // Get questions for validation
    const questionIds = answerBatch.map((a) => a.questionId);
    console.log('new question ids: ', questionIds);
    const questions = await this.getQuestionsCached(questionIds);
    console.log('new question: ', questions);
    const questionMap = new Map(questions.map((q) => [q.id, q]));
    console.log('new question map: ', questionMap);

    for (const answer of answerBatch) {
      // Skip if already answered

      const question = questionMap.get(answer.questionId);
      if (!question) {
        continue; // Invalid question ID
      }

      // Get the category data for this answer
      const categoryData = await this.getCategoryForQuestion(
        progress.sessionId,
        progress.roleId,
        answer.questionId,
        manager,
      );

      console.log(
        `Get category data for the question ${answer.questionId}: `,
        categoryData,
      );

      if (!categoryData) {
        continue; // Question not in user's assigned set
      }
      if (existingQuestionIds.has(answer.questionId)) {
        validated.push({
          userId: progress.userId,
          questionId: answer.questionId,
          sessionRoleCategoryQuestionId: categoryData.id,
          userAnswer: answer.userAnswer,
          isCorrect: this.checkAnswer(
            question.correctAnswer,
            answer.userAnswer,
          ),
          answeredAt: answer.answeredAt,
          isUpdated: true, // Add flag for updates
        });

        continue;
      }

      validated.push({
        userId: progress.userId,
        questionId: answer.questionId,
        sessionRoleCategoryQuestionId: categoryData.id,
        userAnswer: answer.userAnswer,
        isCorrect: this.checkAnswer(question.correctAnswer, answer.userAnswer),
        answeredAt: answer.answeredAt,
      });
    }

    return validated;
  }

  // NEW: Batch save answers
  private async saveAnswerBatch(
    answers: ValidatedAnswer[],
    manager: any,
  ): Promise<void> {
    if (answers.length === 0) return;

    await manager
      .createQueryBuilder()
      .insert()
      .into(UserAnswer)
      .values(answers)
      .orUpdate(
        ['userAnswer', 'isCorrect', 'answeredAt'], // columns to update on conflict
        ['userId', 'questionId', 'sessionRoleCategoryQuestionId'], // conflict target columns
      )
      .execute();
  }

  // Update your existing getProgressSummary method
  async getProgressSummary(
    userId: string,
    sessionId: string,
  ): Promise<ProgressSummary> {
    const progress = await this.userSessionProgressRepo.findOne({
      where: { userId, sessionId },
    });

    if (!progress) throw new NotFoundException('Progress not found');

    return {
      currentCategory: progress.currentCategory,
      currentQuestionIndex: progress.currentQuestionIndex,
      totalAnswered: progress.answeredQuestions,
      totalCorrect: progress.correctlyAnsweredQuestions,
      progressPercentage: progress.getProgressPercentage(),
      status: progress.status,
      completedAt: progress.completedAt ?? undefined,
      isComplete: progress.status === 'completed',
    };
  }

  // NEW: Calculate when next sync should happen
  private calculateNextSyncTime(answersProcessed: number): number {
    // More frequent syncs if user is active
    if (answersProcessed > 5) return 120000; // 2 minutes
    if (answersProcessed > 0) return 180000; // 3 minutes
    return 300000; // 5 minutes if no new answers
  }

  // NEW: Get category data for a specific question
  private async getCategoryForQuestion(
    sessionId: string,
    roleId: number,
    questionId: string,
    manager: any,
  ): Promise<SessionRoleCategoryQuestion | null> {
    const categories = await manager.find(SessionRoleCategoryQuestion, {
      where: { sessionId, roleId },
    });

    console.log(`Get categories for the question ${questionId}: `, categories);

    return (
      categories.find((cat) => cat.questionIds.includes(questionId)) || null
    );
  }

  private async getQuestionsCached(
    questionIds: string[],
  ): Promise<QuestionBank[]> {
    if (!questionIds || questionIds.length === 0) {
      return [];
    }

    const results: QuestionBank[] = [];
    const uncachedIds: string[] = [];

    // First pass: check cache for all questions
    for (const questionId of questionIds) {
      const cacheKey = `question:${questionId}`;
      const cached = await this.cacheManager.get<QuestionBank>(cacheKey);

      if (cached) {
        results.push(cached);
      } else {
        uncachedIds.push(questionId);
      }
    }

    // Second pass: fetch uncached questions from database
    if (uncachedIds.length > 0) {
      const uncachedQuestions = await this.questionRepo.find({
        where: { id: In(uncachedIds) },
      });

      // Check if all requested questions were found
      const foundIds = uncachedQuestions.map((q) => q.id);
      const missingIds = uncachedIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new BadRequestException(
          `Questions not found: ${missingIds.join(', ')}`,
        );
      }

      // Cache the newly fetched questions and add to results
      for (const question of uncachedQuestions) {
        const cacheKey = `question:${question.id}`;
        await this.cacheManager.set(cacheKey, question);
        results.push(question);
      }
    }

    // Sort results to match the order of input questionIds
    const questionMap = new Map(results.map((q) => [q.id, q]));
    return questionIds.map((id) => questionMap.get(id)!);
  }

  /**
   * Normalize and check if answer is correct
   */
  private checkAnswer(correctAnswer: number, userAnswer: number): boolean {
    return correctAnswer === userAnswer;
  }

  async resetUserProgress(sessionId: string, dto: RetakeSessionDto) {
    const progress = await this.userSessionProgressRepo.findOne({
      where: { userId: dto.userId, sessionId },
    });
    console.log('Retake 3: ', progress);

    if (!progress) {
      throw new Error('Progress not found');
    }

    // Step 1: Get question IDs
    const questionIds = await this.sessionRoleCategoryRepo.find({
      where: { sessionId },
      select: ['id'],
    });

    // Step 2: Delete answers
    if (questionIds.length > 0) {
      await this.userAnswerRepo.delete({
        userId: dto.userId,
        sessionRoleCategoryQuestionId: In(questionIds.map((q) => q.id)),
      });
    }

    progress.resetProgress(); // assuming you’ve defined this helper
    await this.userSessionProgressRepo.save(progress);
  }

  async getAdminSessions(page = 1, limit = 5): Promise<AdminSessionsResponse> {
    const [sessions, totalSessions] = await this.sessionRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roleCategoryQuestions'],
      order: { createdAt: 'DESC' },
    });

    // total number of questions across ALL sessions
    const totalQuestions = await this.sessionRoleCategoryRepo
      .createQueryBuilder('rcq')
      .select('SUM(rcq.questionsCount)', 'totalQuestions')
      .getRawOne<{ totalQuestions: string }>();

    // map session summaries
    const sessionSummaries: AdminSessionSummary[] = sessions.map((s) => {
      const totalQuestions = s.roleCategoryQuestions?.reduce(
        (sum, rcq) => sum + (rcq.questionsCount || 0),
        0,
      );
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        totalQuestions,
        createdAt: s.createdAt,
      };
    });

    return {
      totalSessions,
      totalQuestions: Number(totalQuestions?.totalQuestions) || 0,
      sessions: sessionSummaries,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['roleCategoryQuestions'],
    });

    if (!session) throw new NotFoundException('Session not found');

    return session;
  }
}
