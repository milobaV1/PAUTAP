import { SessionStatus } from 'src/core/enums/session.enum';
import { TrainingSession } from 'src/modules/session/entities/training-session.entity';
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
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  selected_questions: string[];

  @Column({ type: 'enum', enum: SessionStatus })
  status: SessionStatus;

  @Column()
  total_score: number;

  @Column()
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.sessions, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => TrainingSession,
    (training_session) => training_session.sessions,
    { nullable: false },
  )
  @JoinColumn({ name: 'training_session_id' })
  training_session: TrainingSession;
}
