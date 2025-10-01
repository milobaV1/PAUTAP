import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from 'src/modules_2/users/entities/user.entity';

@Entity('trivia_leaderboard')
@Unique(['userId', 'month', 'year'])
@Index(['month', 'year', 'totalScore'])
@Index(['userId'])
export class TriviaLeaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column({ default: 0 })
  triviaCount: number; // Number of trivias participated in

  @Column({ default: 0 })
  totalScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageScore: number;

  @Column({ default: 0 })
  bestScore: number;

  @Column({ default: 0 })
  totalCorrectAnswers: number;

  @Column({ default: 0 })
  totalQuestionsAnswered: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallAccuracy: number;

  @Column({ nullable: true })
  rank: number; // Monthly rank

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
