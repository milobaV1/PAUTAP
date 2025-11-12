import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Session } from './session.entity';
import { Role } from 'src/modules_2/users/entities/role.entity';
import { QuestionBank } from 'src/modules_2/question-bank/entities/question-bank.entity';
import { CRISP } from 'src/core/enums/training.enum';
import { UserAnswer } from './user-answers.entity';

@Entity('session_role_question_categories')
@Unique(['sessionId', 'crispCategory'])
@Index(['sessionId'])
export class SessionRoleCategoryQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column({
    type: 'enum',
    enum: CRISP,
  })
  crispCategory: CRISP;

  @Column('simple-json') // Stores array of question IDs
  questionIds: string[];

  @Column({ default: 5 })
  questionsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations

  @OneToMany(() => UserAnswer, (answer) => answer.sessionRoleCategoryQuestion)
  userAnswers: UserAnswer[];

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  // @ManyToOne(() => Role)
  // @JoinColumn({ name: 'roleId' })
  // role: Role;

  // Helper method to get randomized questions
  getRandomizedQuestions(): string[] {
    return [...this.questionIds].sort(() => Math.random() - 0.5);
  }
}
