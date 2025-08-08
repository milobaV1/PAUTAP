import { CRISP } from 'src/core/enums/training.enum';
import { SessionAnswer } from 'src/modules/question-bank/entities/session-answer.entity';
import { UserQuestionHistory } from 'src/modules/question-bank/entities/user-question-history.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class QuestionBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CRISP })
  crisp_category: CRISP;

  @Column()
  question_text: string;

  @Column({ type: 'jsonb' })
  options: any;

  @Column()
  correct_answer: string;

  @Column()
  difficulty_level: string;

  @Column({ type: 'varchar', array: true })
  target_roles: string[];

  @Column({ default: 0 })
  usage_count: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SessionAnswer, (sessionAnswer) => sessionAnswer.question)
  sessionAnswers: SessionAnswer[];

  @OneToMany(
    () => UserQuestionHistory,
    (questionHistory) => questionHistory.question,
  )
  questionHistory: UserQuestionHistory[];
}
