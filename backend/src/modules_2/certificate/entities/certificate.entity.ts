import { CertificateSource } from 'src/core/enums/certificate.enum';
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
@Index(['userId', 'source'])
@Index(['certificateId'])
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  certificateId: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  sessionId: string | null; // Nullable for external certificates

  @Column()
  filePath: string;

  @Column({
    type: 'enum',
    enum: CertificateSource,
    default: CertificateSource.INTERNAL,
  })
  source: CertificateSource;

  @Column({ type: 'int', nullable: true })
  score: number | null; // Nullable for external certificates

  @Column({ nullable: true })
  title: string; // Custom title for external certificates (e.g., "Udemy Python Course")

  @Column({ nullable: true })
  issuedBy: string; // Organization/platform that issued it (e.g., "Udemy", "Coursera")

  @Column({ nullable: true, type: 'date' })
  issuedDate: Date; // When the external certificate was issued

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
    onDelete: 'CASCADE', // Don't allow session deletion if certificates exist
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
