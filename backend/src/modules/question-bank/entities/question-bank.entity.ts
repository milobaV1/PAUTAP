import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';
import { SessionAnswer } from 'src/modules/question-bank/entities/session-answer.entity';
import { UserQuestionHistory } from 'src/modules/question-bank/entities/user-question-history.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import { Role } from 'src/modules/users/entities/role.entity';
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

@Entity()
export class QuestionBank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CRISP })
  crisp_category: CRISP;

  @Column()
  question_text: string;

  @Column({ type: 'jsonb' })
  options: string[];

  @Column()
  correct_answer: number;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty_level: Difficulty;

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
  question_history: UserQuestionHistory[];

  @ManyToMany(() => Role, (role) => role.questions)
  @JoinTable({
    name: 'question_roles',
    joinColumn: { name: 'question_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ManyToMany(() => Session, (session) => session.questions)
  sessions: Session[];
}
