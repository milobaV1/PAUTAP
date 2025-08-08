import { CRISP } from 'src/core/enums/training.enum';
import { ContentProgress } from 'src/modules/course-content/entities/content-progress.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CourseContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CRISP })
  crisp_category: CRISP;

  @Column()
  content_type: string;

  @Column()
  title: string;

  @Column()
  content_url: string;

  @Column()
  duration_minutes: number;

  @Column()
  is_required: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => ContentProgress,
    (contentProgress) => contentProgress.content,
  )
  content_progress: ContentProgress[];
}
