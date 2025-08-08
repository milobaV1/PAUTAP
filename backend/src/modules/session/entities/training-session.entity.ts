import { CRISP } from 'src/core/enums/training.enum';
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';
import { ContentProgress } from 'src/modules/course-content/entities/content-progress.entity';
import { SessionAnswer } from 'src/modules/question-bank/entities/session-answer.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TrainingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: CRISP })
  crisp_categories: CRISP;

  @Column({ type: 'jsonb' })
  selected_content: string[];

  @Column({ type: 'jsonb' })
  questions_config: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Session, (session) => session.training_session)
  sessions: Session[];

  @OneToMany(
    () => ContentProgress,
    (content_progress) => content_progress.training_session,
  )
  content_progress: ContentProgress[];

  @OneToMany(
    () => SessionAnswer,
    (sessionAnswer) => sessionAnswer.training_session,
  )
  sessionAnswers: SessionAnswer[];

  @OneToMany(() => Certificate, (certificate) => certificate.training_session)
  certificates: Certificate[];
}
