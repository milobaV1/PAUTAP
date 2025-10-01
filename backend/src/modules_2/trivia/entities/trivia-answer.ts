import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TriviaParticipation } from './trivia-participation.entity';

@Entity('trivia_answers')
@Index(['participationId', 'questionId'])
export class TriviaAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  participationId: string;

  @Column()
  questionId: string;

  @Column('text')
  selectedAnswer: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ nullable: true })
  timeSpent: number; // Time spent on this question in seconds

  @CreateDateColumn()
  answeredAt: Date;

  // Relations
  @ManyToOne(() => TriviaParticipation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participationId' })
  participation: TriviaParticipation;
}
