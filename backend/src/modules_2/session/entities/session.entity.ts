import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionRoleCategoryQuestion } from './session-role-category-questions.entity';
import { UserSessionProgress } from './user-session-progress.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  questionsGenerated: boolean;

  @Column({ default: 1200 }) // 5 minutes in seconds
  timeLimit: number;

  @Column({ default: false })
  isOnboardingSession: boolean;

  @Column({ default: 5 })
  questionsPerCategory: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => SessionRoleCategoryQuestion,
    (roleCategoryQuestion) => roleCategoryQuestion.session,
    { cascade: true },
  )
  roleCategoryQuestions: SessionRoleCategoryQuestion[];

  @OneToMany(() => UserSessionProgress, (progress) => progress.session, {
    cascade: true,
  })
  userProgress: UserSessionProgress[];
}
