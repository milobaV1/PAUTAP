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
  @ManyToOne(() => User, (user) => user.sessionProgress, {
    onDelete: 'CASCADE', // Add this
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Session, {
    onDelete: 'CASCADE', // Also add this for session
  })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @ManyToOne(() => Role, {
    onDelete: 'RESTRICT', // Keep RESTRICT for role
  })
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
    this.status = ProgressStatus.NOT_STARTED;
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
