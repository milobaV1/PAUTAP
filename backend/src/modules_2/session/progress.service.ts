import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CRISP } from 'src/core/enums/training.enum';
import { ProgressStatus } from 'src/core/enums/user.enum';
import { Repository, DataSource, In } from 'typeorm';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { Role } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SessionRoleCategoryQuestion } from './entities/session-role-category-questions.entity';
import { UserAnswer } from './entities/user-answers.entity';
import { UserSessionProgress } from './entities/user-session-progress.entity';
import { Session } from './entities/session.entity';
import { type Cache } from 'cache-manager';

@Injectable()
export class ProgressService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    @InjectRepository(SessionRoleCategoryQuestion)
    private sessionRoleCategoryRepo: Repository<SessionRoleCategoryQuestion>,
    @InjectRepository(UserAnswer)
    private userAnswerRepo: Repository<UserAnswer>,
    @InjectRepository(UserSessionProgress)
    private userProgressRepo: Repository<UserSessionProgress>,
    @InjectRepository(QuestionBank)
    private questionRepo: Repository<QuestionBank>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private dataSource: DataSource,
  ) {}
  async startOrResumeSession(
    sessionId: string,
    roleId: number,
    userId: string,
  ) {
    // 1) Validate session
    const session = await this.getSession(sessionId);

    // 2) Ensure or create progress
    let progress = await this.getOrCreateProgress(sessionId, roleId, userId);
    if (!progress) throw new Error('No progress');

    // 3) Load role categories (cached if possible)
    const roleCategories = await this.getCategoriesCached(sessionId, roleId);

    // 4) Load user answers for these categories
    const existingAnswers = await this.getUserAnswers(userId, roleCategories);

    // 5) Build snapshot (answered/remaining)
    const byCategory = this.buildCategorySnapshot(
      roleCategories,
      existingAnswers,
    );

    // 6) Update progress (status, part, scores)
    this.updateProgressFromSnapshot(progress, byCategory);
    await this.userProgressRepo.save(progress);

    // 7) Return clean result
    return this.formatResult(session, progress, byCategory);
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
  ) {
    let progress = await this.userProgressRepo.findOne({
      where: { user: { id: userId }, session: { id: sessionId } },
      relations: ['user', 'session', 'role'],
    });

    if (!progress) {
      progress = this.userProgressRepo.create({
        user: { id: userId } as User,
        session: { id: sessionId } as Session,
        role: { id: roleId } as Role,
        status: ProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        lastActiveAt: new Date(),
        currentCategory: CRISP.C,
        currentQuestionIndex: 0,
      });
      return this.userProgressRepo.save(progress);
    }
    progress.lastActiveAt = new Date();
    if (!progress.role || progress.role.id !== roleId)
      throw new Error('Role must match'); //Not sure which
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

  private updateProgressFromSnapshot(
    progress: UserSessionProgress,
    snapshot: any[],
  ) {
    const totalRequired = snapshot.reduce(
      (sum, c) => sum + c.requiredIds.length,
      0,
    );
    const totalAnswered = snapshot.reduce(
      (sum, c) => sum + c.answeredIds.length,
      0,
    );
    const totalCorrect = snapshot.reduce(
      (sum, c) => sum + c.correctlyAnsweredCount,
      0,
    );

    progress.totalQuestions = totalRequired;
    progress.answeredQuestions = totalAnswered;
    progress.correctlyAnsweredQuestions = totalCorrect;

    const next = snapshot.find((c) => c.remainingIds.length > 0);
    if (next) {
      progress.currentCategory = next.category as CRISP;
      progress.currentQuestionIndex = next.requiredIds.indexOf(
        next.remainingIds[0],
      );
      progress.status = ProgressStatus.IN_PROGRESS;
    } else {
      progress.currentCategory = undefined;
      progress.currentQuestionIndex = 0;
      progress.status = ProgressStatus.COMPLETED;
      progress.completedAt = new Date();
    }
  }

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
}
