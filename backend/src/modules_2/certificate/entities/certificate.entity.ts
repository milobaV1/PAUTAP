import { User } from 'src/modules_2/users/entities/user.entity';
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
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  session_id: string;

  @Column()
  certificate_type: string;

  @Column({ type: 'jsonb' })
  criteria_met: any;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.certificates)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @ManyToOne(() => TrainingSession, (session) => session.certificates)
  // training_session: TrainingSession;
}
