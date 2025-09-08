import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CRISP } from 'src/core/enums/training.enum';
import { ProgressStatus } from 'src/core/enums/user.enum';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';
import { SessionRoleCategoryQuestion } from './entities/session-role-category-questions.entity';
import { UserAnswer } from './entities/user-answers.entity';
import { UserSessionProgress } from './entities/user-session-progress.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { type Cache } from 'cache-manager';

@Injectable()
export class AnswerService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(SessionRoleCategoryQuestion)
    private sessionRoleCategoryRepo: Repository<SessionRoleCategoryQuestion>,
    @InjectRepository(QuestionBank)
    private questionRepo: Repository<QuestionBank>,
    private dataSource: DataSource,
  ) {}

  async answerQuestion(
    userId: string,
    sessionId: string,
    questionId: string,
    userAnswer: number,
  ): Promise<{
    isCorrect: boolean;
    nextQuestion?: any;
    sessionComplete?: boolean;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) Get user progress
      const progress = await queryRunner.manager.findOne(UserSessionProgress, {
        where: { userId, sessionId },
        relations: ['role'],
      });

      if (!progress || progress.status === 'completed') {
        throw new BadRequestException('Invalid or already completed progress');
      }

      // 2) Get current category (cached)
      const cacheKey = `session:${sessionId}:role:${progress.roleId}:category:${progress.currentCategory}`;
      let categoryData =
        await this.cacheManager.get<SessionRoleCategoryQuestion>(cacheKey);

      if (!categoryData) {
        const foundCategoryData = await queryRunner.manager.findOne(
          SessionRoleCategoryQuestion,
          {
            where: {
              sessionId,
              roleId: progress.roleId,
              crispCategory: progress.currentCategory,
            },
          },
        );
        categoryData =
          foundCategoryData === null ? undefined : foundCategoryData;

        if (!categoryData) {
          throw new BadRequestException('Category not found');
        }

        await this.cacheManager.set(cacheKey, categoryData);
      }

      // 3) Ensure the answered question matches expected
      const expectedQuestionId =
        categoryData.questionIds[progress.currentQuestionIndex];
      if (String(expectedQuestionId) !== String(questionId)) {
        throw new BadRequestException('Unexpected question answered');
      }

      // 4) Get the question (cached)
      const question = await this.getQuestionCached(questionId);
      const isCorrect = this.checkAnswer(question.correctAnswer, userAnswer);

      // 5) Save user answer
      await queryRunner.manager.save(UserAnswer, {
        userId,
        sessionRoleCategoryQuestionId: categoryData.id,
        questionId,
        userAnswer,
        isCorrect,
        answeredAt: new Date(),
      });

      // 6) Update progress
      const progressUpdate = await this.calculateProgressUpdate(
        progress,
        isCorrect,
        sessionId,
      );
      await queryRunner.manager.save(UserSessionProgress, {
        ...progress,
        ...progressUpdate,
      });

      await queryRunner.commitTransaction();

      // 7) Build response
      return this.buildAnswerResponse(
        isCorrect,
        progressUpdate,
        sessionId,
        progress.roleId,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cached question fetcher
   */
  private async getQuestionCached(questionId: string): Promise<QuestionBank> {
    const cacheKey = `question:${questionId}`;
    let cached = await this.cacheManager.get<QuestionBank>(cacheKey);

    if (!cached) {
      const question = await this.questionRepo.findOne({
        where: { id: questionId },
      });
      if (!question) throw new BadRequestException('Question not found');

      await this.cacheManager.set(cacheKey, question);
      return question;
    }

    return cached;
  }

  /**
   * Normalize and check if answer is correct
   */
  private checkAnswer(correctAnswer: number, userAnswer: number): boolean {
    return correctAnswer === userAnswer;
  }

  /**
   * Compute next progress state
   */
  private async calculateProgressUpdate(
    progress: UserSessionProgress,
    isCorrect: boolean,
    sessionId: string,
  ): Promise<Partial<UserSessionProgress>> {
    const update: Partial<UserSessionProgress> = {
      answeredQuestions: progress.answeredQuestions + 1,
      correctlyAnsweredQuestions:
        progress.correctlyAnsweredQuestions + (isCorrect ? 1 : 0),
      lastActiveAt: new Date(),
    };

    // Find next question/category
    let nextPosition;
    if (progress.currentCategory !== undefined) {
      nextPosition = await this.getNextQuestionPosition(
        sessionId,
        progress.roleId,
        progress.currentCategory,
        progress.currentQuestionIndex + 1,
      );
    } else {
      // If currentCategory is undefined, mark as completed
      nextPosition = { category: undefined, questionIndex: 0, completed: true };
    }

    if (nextPosition.completed) {
      update.status = ProgressStatus.COMPLETED;
      update.completedAt = new Date();
      update.currentCategory = undefined;
      update.currentQuestionIndex = 0;
    } else {
      update.currentCategory = nextPosition.category;
      update.currentQuestionIndex = nextPosition.questionIndex;
    }

    return update;
  }

  /**
   * Figure out what the next question is
   */
  private async getNextQuestionPosition(
    sessionId: string,
    roleId: number,
    currentCategory: CRISP,
    nextIndex: number,
  ): Promise<{
    category: CRISP | undefined;
    questionIndex: number;
    completed: boolean;
  }> {
    const categories: CRISP[] = [CRISP.C, CRISP.R, CRISP.I, CRISP.S, CRISP.P]; // fixed order
    const currentCategoryIndex = categories.indexOf(currentCategory);

    // Try to continue in the same category
    const currentCategoryData = await this.sessionRoleCategoryRepo.findOne({
      where: { sessionId, roleId, crispCategory: currentCategory as any },
    });

    if (
      currentCategoryData &&
      nextIndex < currentCategoryData.questionIds.length
    ) {
      return {
        category: currentCategory,
        questionIndex: nextIndex,
        completed: false,
      };
    }

    // Otherwise, move to next available category
    for (let i = currentCategoryIndex + 1; i < categories.length; i++) {
      const nextCategoryData = await this.sessionRoleCategoryRepo.findOne({
        where: { sessionId, roleId, crispCategory: categories[i] as any },
      });

      if (nextCategoryData && nextCategoryData.questionIds.length > 0) {
        return { category: categories[i], questionIndex: 0, completed: false };
      }
    }

    // No more questions left
    return { category: undefined, questionIndex: 0, completed: true };
  }

  /**
   * Build the response for the frontend
   */
  private async buildAnswerResponse(
    isCorrect: boolean,
    progressUpdate: Partial<UserSessionProgress>,
    sessionId: string,
    roleId: number,
  ) {
    if (progressUpdate.status === 'completed') {
      return { isCorrect, sessionComplete: true };
    }

    // Get the next question
    const nextCategoryData = await this.sessionRoleCategoryRepo.findOne({
      where: {
        sessionId,
        roleId,
        crispCategory: progressUpdate.currentCategory as any,
      },
    });

    if (!nextCategoryData) {
      return { isCorrect, sessionComplete: true };
    }

    const questionIndex =
      typeof progressUpdate.currentQuestionIndex === 'number'
        ? progressUpdate.currentQuestionIndex
        : 0;
    const nextQuestionId = nextCategoryData.questionIds[questionIndex];
    const nextQuestion = await this.getQuestionCached(nextQuestionId);

    return {
      isCorrect,
      nextQuestion: {
        id: nextQuestion.id,
        text: nextQuestion.questionText,
        category: progressUpdate.currentCategory,
      },
      sessionComplete: false,
    };
  }

  // async answerQuestion(
  //   sessionId: string,
  //   roleId: number,
  //   userId: string,
  //   questionId: string,
  //   userAnswer: string,
  //   isCorrect: boolean,
  // ) {
  //   // 1️⃣ Ensure progress exists
  //   let progress = await this.getOrCreateProgress(sessionId, roleId, userId);
  //   if (!progress) throw new Error('No progress found');

  //   // 2️⃣ Find the SessionRoleCategoryQuestion for this question
  //   const roleCategories = await this.getCategoriesCached(sessionId, roleId);
  //   const rc = roleCategories.find((rc) => rc.questionIds.includes(questionId));
  //   if (!rc) throw new NotFoundException('Question not found in session/role');

  //   // 3️⃣ Check if user already answered
  //   let existingAnswer = await this.userAnswerRepo.findOne({
  //     where: {
  //       user: { id: userId },
  //       question: { id: questionId },
  //       sessionRoleCategoryQuestion: { id: rc.id },
  //     },
  //   });

  //   if (!existingAnswer) {
  //     // ➕ New answer
  //     existingAnswer = this.userAnswerRepo.create({
  //       user: { id: userId } as User,
  //       question: { id: questionId } as QuestionBank,
  //       sessionRoleCategoryQuestion: {
  //         id: rc.id,
  //       } as SessionRoleCategoryQuestion,
  //       userAnswer,
  //       isCorrect,
  //     });

  //     await this.userAnswerRepo.save(existingAnswer);

  //     // Increment totals
  //     progress.answeredQuestions += 1;
  //     if (isCorrect) progress.correctlyAnsweredQuestions += 1;
  //   } else {
  //     // ✏️ Update existing answer
  //     const wasCorrect = existingAnswer.isCorrect;
  //     existingAnswer.userAnswer = userAnswer;
  //     existingAnswer.isCorrect = isCorrect;
  //     await this.userAnswerRepo.save(existingAnswer);

  //     // Adjust counters if correctness changed
  //     if (!wasCorrect && isCorrect) {
  //       progress.correctlyAnsweredQuestions += 1;
  //     } else if (wasCorrect && !isCorrect) {
  //       progress.correctlyAnsweredQuestions -= 1;
  //     }
  //   }

  //   // 4️⃣ Update status
  //   if (progress.answeredQuestions >= progress.totalQuestions) {
  //     progress.status = ProgressStatus.COMPLETED;
  //     progress.completedAt = new Date();
  //   } else {
  //     progress.status = ProgressStatus.IN_PROGRESS;
  //   }
  //   progress.lastActiveAt = new Date();

  //   await this.userProgressRepo.save(progress);

  //   // 5️⃣ Return lightweight result
  //   return {
  //     progress,
  //     answeredQuestionId: questionId,
  //     isCorrect,
  //   };
  // }
}
