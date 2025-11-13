import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Department } from './department.entity';
import { UserQuestionHistory } from 'src/modules_2/question-bank/entities/user-question-history.entity';
import { Certificate } from 'src/modules_2/certificate/entities/certificate.entity';
import * as bcrypt from 'bcrypt';
import { TriviaLeaderboard } from 'src/modules_2/trivia/entities/trivia-leaderboard';
import { UserSessionProgress } from 'src/modules_2/session/entities/user-session-progress.entity';
import { UserAnswer } from 'src/modules_2/session/entities/user-answers.entity';
import { TriviaParticipation } from 'src/modules_2/trivia/entities/trivia-participation.entity';
import { UserLevel } from 'src/core/enums/user.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserLevel, default: UserLevel.NORMAL })
  level: UserLevel;

  @Column({ default: false })
  is_onboarding: boolean;

  @Column()
  password: string;

  // @Column({ type: 'enum', enum: Difficulty, default: Difficulty.BEGINNER })
  // level: Difficulty;

  @Column({ nullable: true })
  resetToken?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(
    () => UserQuestionHistory,
    (questionHistory) => questionHistory.user,
    { cascade: true, onDelete: 'CASCADE' }, // Add this
  )
  question_history: UserQuestionHistory[];

  @OneToMany(() => Certificate, (certificate) => certificate.user, {
    cascade: true,
    onDelete: 'CASCADE', // Add this
  })
  certificates: Certificate[];

  @OneToMany(() => TriviaLeaderboard, (leaderboard) => leaderboard.user, {
    cascade: true,
    onDelete: 'CASCADE', // Add this
  })
  leaderboard: TriviaLeaderboard[];

  @OneToMany(() => TriviaParticipation, (participation) => participation.user, {
    cascade: true,
  })
  participation: TriviaParticipation[];

  @OneToMany(() => UserSessionProgress, (progress) => progress.user, {
    cascade: true,
  })
  sessionProgress: UserSessionProgress[];

  @OneToMany(() => UserAnswer, (answer) => answer.user, {
    cascade: true,
  })
  userAnswer: UserAnswer[];

  @BeforeInsert()
  async hashPassword() {
    this.email = this.email.toLowerCase().trim();
    this.password = await bcrypt.hash(this.password.trim(), 10);
  }

  @BeforeUpdate()
  async hashNewPassword() {
    this.email = this.email.toLowerCase().trim();
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password.trim(), 10);
    }
  }

  get department(): Department {
    return this.role?.department;
  }
}

// @OneToMany(() => Session, (session) => session.user)
// sessions: Session[];

// @OneToMany(() => ContentProgress, (content_progress) => content_progress.user)
// content_progress: ContentProgress[];

// @OneToMany(() => SessionAnswer, (sessionAnswer) => sessionAnswer.user)
// sessionAnswers: SessionAnswer[];

// @OneToMany(() => Notification, (notification) => notification.user)
// notifications: Notification[];
