import { Role } from 'src/modules_2/users/entities/role.entity';
import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuestionBank } from './question-bank.entity';
import { Session } from 'src/modules_2/session/entities/session.entity';

@Entity('question_usage')
@Unique(['question', 'role'])
export class QuestionUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionId: string;

  @Column()
  roleId: number;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @Column({ nullable: true })
  lastUsedInSessionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => QuestionBank)
  @JoinColumn({ name: 'questionId' })
  question: QuestionBank;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lastUsedInSessionId' })
  lastUsedInSession: Session;
}
