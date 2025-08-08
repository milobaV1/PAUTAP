import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Department } from './department.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import { TrainingSession } from 'src/modules/session/entities/training-session.entity';
import { ContentProgress } from 'src/modules/course-content/entities/content-progress.entity';
import { SessionAnswer } from 'src/modules/question-bank/entities/session-answer.entity';
import { UserQuestionHistory } from 'src/modules/question-bank/entities/user-question-history.entity';
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ default: true })
  is_onboarding: boolean;

  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => ContentProgress, (content_progress) => content_progress.user)
  content_progress: ContentProgress[];

  @OneToMany(() => SessionAnswer, (sessionAnswer) => sessionAnswer.user)
  sessionAnswers: SessionAnswer[];

  @OneToMany(
    () => UserQuestionHistory,
    (questionHistory) => questionHistory.user,
  )
  questionHistory: UserQuestionHistory[];

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];

  // @OneToMany(() => Notification, (notification) => notification.user)
  // notifications: Notification[];

  get department(): Department {
    return this.role?.department;
  }
}
