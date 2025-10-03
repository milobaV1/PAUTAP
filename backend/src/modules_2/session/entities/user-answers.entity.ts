import { User } from 'src/modules_2/users/entities/user.entity';
import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SessionRoleCategoryQuestion } from './session-role-category-questions.entity';
import { QuestionBank } from 'src/modules_2/question-bank/entities/question-bank.entity';

@Entity('user_answers')
@Index(['userId', 'questionId', 'sessionRoleCategoryQuestionId'], {
  unique: true,
})
export class UserAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  questionId: string;

  @Column()
  sessionRoleCategoryQuestionId: number;

  @Column()
  userAnswer: number;

  @Column()
  isCorrect: boolean;

  @CreateDateColumn()
  answeredAt: Date;

  // Relations
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => QuestionBank)
  @JoinColumn({ name: 'questionId' })
  question: QuestionBank;

  @ManyToOne(() => SessionRoleCategoryQuestion, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionRoleCategoryQuestionId' })
  sessionRoleCategoryQuestion: SessionRoleCategoryQuestion;
}
