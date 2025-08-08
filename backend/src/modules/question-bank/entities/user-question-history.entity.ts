import { QuestionBank } from 'src/modules/question-bank/entities/question-bank.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserQuestionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  question_id: string;

  @Column({ default: 0 })
  times_seen: number;

  @Column({ default: 0 })
  times_correct: number;

  @Column({ type: 'timestamp', nullable: true })
  last_seen_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.questionHistory)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => QuestionBank, (question) => question.questionHistory)
  @JoinColumn({ name: 'question_id' })
  question: QuestionBank;
}
