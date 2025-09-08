import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionUsage } from './question-usage.entity';
import { Role } from 'src/modules_2/users/entities/role.entity';
import { UserQuestionHistory } from './user-question-history.entity';
//import { Session } from 'src/modules_2/session/entities/session.entity';

@Entity()
export class QuestionBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CRISP })
  crispCategory: CRISP;

  @Column()
  questionText: string;

  @Column({ type: 'jsonb' })
  options: string[];

  @Column()
  correctAnswer: number;

  @Column({ type: 'enum', enum: Difficulty })
  difficultyLevel: Difficulty;

  // @Column({ default: 0 })
  // usage_count: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => SessionAnswer, (sessionAnswer) => sessionAnswer.question)
  // sessionAnswers: SessionAnswer[];

  @OneToMany(() => QuestionUsage, (usage) => usage.question)
  usages: QuestionUsage[];

  @OneToMany(
    () => UserQuestionHistory,
    (questionHistory) => questionHistory.question,
  )
  question_history: UserQuestionHistory[];

  @ManyToMany(() => Role, (role) => role.questions)
  @JoinTable({
    name: 'question_roles',
    joinColumn: { name: 'question_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // @ManyToMany(() => Session, (session) => session.questions)
  // sessions: Session[];
}
