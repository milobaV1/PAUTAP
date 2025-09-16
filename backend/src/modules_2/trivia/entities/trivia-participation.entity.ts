import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { Trivia } from './trivia.entity';
import { User } from 'src/modules_2/users/entities/user.entity';
import { TriviaAnswer } from './trivia-answer';
import { ParticipationStatus } from 'src/core/enums/trivia.enum';

@Entity('trivia_participations')
@Unique(['triviaId', 'userId'])
@Index(['triviaId', 'userId'])
@Index(['score'])
export class TriviaParticipation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  triviaId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ParticipationStatus,
    default: ParticipationStatus.NOT_STARTED,
  })
  status: ParticipationStatus;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  totalAnswered: number;

  @Column({ nullable: true })
  timeSpent: number; // in seconds

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Trivia)
  @JoinColumn({ name: 'triviaId' })
  trivia: Trivia;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => TriviaAnswer, (answer) => answer.participation)
  answers: TriviaAnswer[];

  // Helper methods
  getAccuracyPercentage(): number {
    if (this.totalAnswered === 0) return 0;
    return (this.correctAnswers / this.totalAnswered) * 100;
  }

  isCompleted(): boolean {
    return (
      this.status === ParticipationStatus.COMPLETED ||
      this.status === ParticipationStatus.SUBMITTED
    );
  }

  isExpired(): boolean {
    return this.status === ParticipationStatus.EXPIRED;
  }
}
