import { Role } from 'src/modules_2/users/entities/role.entity';
import { User } from 'src/modules_2/users/entities/user.entity';
import {
  Entity,
  Unique,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
//import { SessionRoleQuestion } from './session-role-category-questions.entity';
import { Session } from './session.entity';
import { CRISP } from 'src/core/enums/training.enum';
import { ProgressStatus } from 'src/core/enums/user.enum';
import { Certificate } from 'src/modules_2/certificate/entities/certificate.entity';

// @Entity('user_session_progress')
// @Unique(['user', 'session'])
// @Index(['user', 'session', 'currentPart'])
// export class UserSessionProgress {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: 1 })
//   currentPart: number; // 1-5

//   @Column({
//     type: 'enum',
//     enum: ProgressStatus,
//     default: ProgressStatus.NOT_STARTED,
//   })
//   status: ProgressStatus;

//   // Current question tracking within current part
//   @Column({ default: 0 })
//   currentQuestionIndex: number;

//   // Part completion tracking
//   @Column({ default: 0 })
//   partCCompleted: number;

//   @Column({ default: 0 })
//   partRCompleted: number;

//   @Column({ default: 0 })
//   partICompleted: number;

//   @Column({ default: 0 })
//   partSCompleted: number;

//   @Column({ default: 0 })
//   partPCompleted: number;

//   // Scoring
//   @Column({ default: 0 })
//   totalQuestionsAnswered: number;

//   @Column({ default: 0 })
//   totalCorrectAnswers: number;

//   @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
//   overallScore: number;

//   @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
//   partCScore: number;

//   @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
//   partRScore: number;

//   @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
//   partIScore: number;

//   @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
//   partSScore: number;

//   @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
//   partPScore: number;

//   // Timestamps
//   @Column({ nullable: true })
//   startedAt: Date;

//   @Column({ nullable: true })
//   lastActiveAt: Date;

//   @Column({ nullable: true })
//   completedAt: Date;

//   @Column({ nullable: true })
//   partCCompletedAt: Date;

//   @Column({ nullable: true })
//   partRCompletedAt: Date;

//   @Column({ nullable: true })
//   partICompletedAt: Date;

//   @Column({ nullable: true })
//   partSCompletedAt: Date;

//   @Column({ nullable: true })
//   partPCompletedAt: Date;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   // Relations
//   @ManyToOne(() => User)
//   @JoinColumn({ name: 'userId' })
//   user: User;

//   @ManyToOne(() => Session)
//   @JoinColumn({ name: 'sessionId' })
//   session: Session;

//   @ManyToOne(() => Role)
//   @JoinColumn({ name: 'roleId' })
//   role: Role;

//   getProgressPercentage(): number {
//     return (this.totalQuestionsAnswered / 50) * 100; // 50 total questions (10 per part)
//   }

//   getCurrentPartLetter(): CRISP {
//     const parts: CRISP[] = [CRISP.C, CRISP.R, CRISP.I, CRISP.S, CRISP.P];
//     return parts[this.currentPart - 1];
//   }
// }
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   JoinColumn,
//   Index,
//   Unique,
// } from 'typeorm';

// User Progress Entity
@Entity('user_session_progress')
@Unique(['userId', 'sessionId'])
@Index(['userId', 'sessionId'])
export class UserSessionProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  sessionId: string;

  @Column()
  roleId: number;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({
    type: 'enum',
    enum: CRISP,
    default: CRISP.C,
  })
  currentCategory: CRISP;

  @Column({ default: 0 })
  currentQuestionIndex: number; // Index in the question array for current category

  // Overall progress tracking
  @Column({ default: 0 })
  totalQuestions: number; // Total questions for this role in this session

  @Column({ default: 0 })
  answeredQuestions: number; // How many questions user has answered

  @Column({ default: 0 })
  correctlyAnsweredQuestions: number; // How many answered correctly

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallScore: number;

  @Column({
    type: 'json',
    default: () => "'{}'",
  })
  categoryScores: Record<string, number>;

  // Timestamps
  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Session)
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToOne(() => Certificate, (certificate) => certificate.userProgress)
  certificate: Certificate;

  // Helper methods
  getProgressPercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return (this.answeredQuestions / this.totalQuestions) * 100;
  }

  getAccuracyPercentage(): number {
    if (this.answeredQuestions === 0) return 0;
    return (this.correctlyAnsweredQuestions / this.answeredQuestions) * 100;
  }

  isCompleted(): boolean {
    return (
      this.status === 'completed' ||
      this.answeredQuestions === this.totalQuestions
    );
  }

  // In user-session-progress.entity.ts

  resetProgress(): void {
    this.status = 'not_started' as any; // or ProgressStatus.NOT_STARTED
    this.currentCategory = CRISP.C;
    this.currentQuestionIndex = 0;
    this.answeredQuestions = 0;
    this.correctlyAnsweredQuestions = 0;
    this.overallScore = 0;
    this.categoryScores = {};

    this.startedAt = new Date();
    this.lastActiveAt = new Date();
    this.completedAt = null;

    // keep createdAt, updatedAt untouched (updatedAt will auto-update when saved)
  }
}
