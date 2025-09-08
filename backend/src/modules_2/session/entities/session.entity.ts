import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionRoleCategoryQuestion } from './session-role-category-questions.entity';
import { UserSessionProgress } from './user-session-progress.entity';
import { Difficulty } from 'src/core/enums/question.enum';

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

  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.BEGINNER })
  difficulty: Difficulty;

  @Column({ default: false })
  questionsGenerated: boolean;

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

  @OneToMany(() => UserSessionProgress, (progress) => progress.session)
  userProgress: UserSessionProgress[];
}
