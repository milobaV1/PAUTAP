import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { User } from './user.entity';
import { QuestionBank } from 'src/modules_2/question-bank/entities/question-bank.entity';
import { QuestionUsage } from 'src/modules_2/question-bank/entities/question-usage.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Department, (department) => department.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  // @OneToMany(() => QuestionUsage, (usage) => usage.role)
  // questionUsages: QuestionUsage[];

  // @ManyToMany(() => QuestionBank, (question) => question.roles)
  // questions: QuestionBank[];
}
