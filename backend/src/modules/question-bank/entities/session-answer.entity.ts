import { QuestionBank } from 'src/modules/question-bank/entities/question-bank.entity';
import { TrainingSession } from 'src/modules/session/entities/training-session.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SessionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  session_id: string;

  @Column()
  question_id: string;

  @Column()
  selected_answer: string;

  @Column()
  is_correct: boolean;

  @Column({ type: 'int', default: 0 })
  points_earned: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.sessionAnswers)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TrainingSession, (session) => session.sessionAnswers)
  @JoinColumn({ name: 'training_session_id' })
  training_session: TrainingSession;

  @ManyToOne(() => QuestionBank, (question) => question.sessionAnswers)
  @JoinColumn({ name: 'question_id' })
  question: QuestionBank;
}
