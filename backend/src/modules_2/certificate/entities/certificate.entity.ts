import { Session } from 'src/modules_2/session/entities/session.entity';
import { UserSessionProgress } from 'src/modules_2/session/entities/user-session-progress.entity';
import { User } from 'src/modules_2/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['userId', 'sessionId']) // Ensures one certificate per user per session
@Index(['certificateId']) // For quick lookups by certificate ID
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  certificateId: string;

  @Column()
  userId: string;

  @Column()
  sessionId: string;

  @Column()
  filePath: string;

  @Column()
  score: number;

  // @Column({ type: 'jsonb' })
  // criteriaMet: any;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.certificates, {
    onDelete: 'CASCADE', // If user is deleted, remove their certificates
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Session, {
    onDelete: 'RESTRICT', // Don't allow session deletion if certificates exist
  })
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  // One-to-one with UserSessionProgress to link the completion record
  @ManyToOne(() => UserSessionProgress, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'userId', referencedColumnName: 'userId' },
    { name: 'sessionId', referencedColumnName: 'sessionId' },
  ])
  userProgress: UserSessionProgress;
}
