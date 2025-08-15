import { ContentType } from 'src/core/enums/course.enum';
import { Difficulty } from 'src/core/enums/question.enum';
import { CRISP } from 'src/core/enums/training.enum';
import { ContentProgress } from 'src/modules/course-content/entities/content-progress.entity';
import { TrainingSession } from 'src/modules/session/entities/training-session.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CourseContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CRISP })
  crisp_category: CRISP;

  @Column({ type: 'enum', enum: ContentType })
  content_type: ContentType;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty_level: Difficulty;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  duration_minutes: number;

  @Column({ default: true })
  is_required: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => TrainingSession, (trainingSession) => trainingSession.course)
  @JoinColumn()
  training_session: TrainingSession;

  @OneToMany(
    () => ContentProgress,
    (contentProgress) => contentProgress.content,
  )
  content_progress: ContentProgress[];

  @BeforeInsert()
  @BeforeUpdate()
  validateContent() {
    if (this.content_type === ContentType.VIDEO) {
      if (!this.isValidUrl(this.content)) {
        throw new Error('Invalid video URL');
      }
    } else if (this.content_type === ContentType.TEXT) {
      if (!this.content?.trim()) {
        throw new Error('Text content cannot be empty');
      }
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  get videoUrl(): string | null {
    return this.content_type === ContentType.VIDEO ? this.content : null;
  }

  get textContent(): string | null {
    return this.content_type === ContentType.TEXT ? this.content : null;
  }
}
