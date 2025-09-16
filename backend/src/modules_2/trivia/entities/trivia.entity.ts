import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { TriviaParticipation } from './trivia-participation.entity';
import { TriviaStatus } from 'src/core/enums/trivia.enum';

@Entity('trivias')
@Index(['scheduledAt'])
@Index(['status'])
export class Trivia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'json' }) // Array of question IDs
  questionIds: string[];

  @Column({ default: 10 })
  totalQuestions: number;

  @Column({ default: 300 }) // 5 minutes in seconds
  timeLimit: number;

  @Column({ type: 'enum', enum: TriviaStatus, default: TriviaStatus.SCHEDULED })
  status: TriviaStatus;

  @Column()
  scheduledAt: Date;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column({ default: false })
  emailSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TriviaParticipation, (participation) => participation.trivia)
  participations: TriviaParticipation[];

  // Helper methods
  isActive(): boolean {
    return (
      this.status === TriviaStatus.ACTIVE &&
      new Date() >= this.startedAt &&
      new Date() <= this.endedAt
    );
  }

  isExpired(): boolean {
    return (
      this.status === TriviaStatus.EXPIRED ||
      (this.endedAt && new Date() > this.endedAt)
    );
  }

  canParticipate(): boolean {
    return this.isActive() && !this.isExpired();
  }
}
