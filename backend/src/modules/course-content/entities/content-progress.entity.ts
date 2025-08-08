import { CourseContent } from 'src/modules/course-content/entities/course-content.entity';
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
export class ContentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  session_id: string;

  @Column()
  content_id: string;

  @Column({ type: 'float', default: 0 })
  progress_percentage: number;

  @Column({ default: false })
  is_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.content_progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TrainingSession, (session) => session.content_progress)
  @JoinColumn({ name: 'training_session_id' })
  training_session: TrainingSession;

  @ManyToOne(() => CourseContent, (content) => content.content_progress)
  @JoinColumn({ name: 'content_id' })
  content: CourseContent;
}
