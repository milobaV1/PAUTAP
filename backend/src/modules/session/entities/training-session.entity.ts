import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';
import { Certificate } from 'src/modules/certificate/entities/certificate.entity';
import { ContentProgress } from 'src/modules/course-content/entities/content-progress.entity';
import { CourseContent } from 'src/modules/course-content/entities/course-content.entity';
import { SessionAnswer } from 'src/modules/question-bank/entities/session-answer.entity';
import { Session } from 'src/modules/session/entities/session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface QuestionConfig {
  C: number;
  R: number;
  I: number;
  S: number;
  P: number;
  [key: string]: number;
}

@Entity()
export class TrainingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'enum', enum: CRISP })
  crisp_categories: CRISP;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty_level: Difficulty;

  @Column({ type: 'jsonb' })
  questions_config: QuestionConfig;

  @Column()
  duration_minutes: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(
    () => CourseContent,
    (courseContent) => courseContent.training_session,
  )
  course: CourseContent;

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
