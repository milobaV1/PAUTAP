import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingSession } from './entities/training-session.entity';
import { In, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CourseContentService } from '../course-content/course-content.service';
import { CourseContent } from '../course-content/entities/course-content.entity';
import { QuestionBank } from '../question-bank/entities/question-bank.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(TrainingSession)
    private trainingRepo: Repository<TrainingSession>,
    @InjectRepository(Session) private userSessionRepo: Repository<Session>,
    @InjectRepository(CourseContent)
    private courseRepo: Repository<CourseContent>,
    @InjectRepository(QuestionBank)
    private readonly questionRepo: Repository<QuestionBank>,
  ) {}

  async createTrainingSession(
    createTrainingSessionDto: CreateTrainingSessionDto,
  ) {
    const { course_id, ...rest } = createTrainingSessionDto;
    //const training = this.findOneTrainingSession(rest.title);
    const course = await this.courseRepo.findOne({
      where: { id: course_id },
    });
    if (!course) throw new NotFoundException('course not found');
    const newTraining = this.trainingRepo.create({
      ...rest,
      course,
    });

    return await this.trainingRepo.save(newTraining);
  }

  async createUserSession(createSessionDto: CreateSessionDto) {
    const { question_ids, ...rest } = createSessionDto;
    let questions: QuestionBank[] = [];
    if (question_ids && question_ids.length > 0) {
      questions = await this.questionRepo.find({
        where: { id: In(question_ids) },
      });

      if (questions.length !== question_ids.length) {
        const foundQuestionsIds = questions.map((question) => question.id);
        const missingQuestionsIds = question_ids.filter(
          (id) => !foundQuestionsIds.includes(id),
        );
        throw new BadRequestException(
          `Questions with IDs [${missingQuestionsIds.join(', ')}] not found`,
        );
      }
    }
    const session = this.userSessionRepo.create({
      ...rest,
      questions,
    });
    return await this.userSessionRepo.save(session);
  }

  async findAllTrainingSessions() {
    const trainings = await this.trainingRepo.find({
      relations: [
        'course',
        'sessions',
        'content_progress',
        'sessionAnswers',
        'certificates',
      ],
    });

    return trainings;
  }

  async findAllUserSessions() {
    const userSessions = await this.userSessionRepo.find({
      relations: ['user', 'training_session', 'questions'],
    });
  }

  async findOneTrainingSession(
    // searchString: 'id' | 'name',
    // searchValue: string | number,
    id: string,
  ) {
    const training = await this.trainingRepo.findOne({
      where: { id },
      relations: [
        'course',
        'sessions',
        'content_progress',
        'sessionAnswers',
        'certificates',
      ],
    });

    return training;
  }

  async findOneUserSession(id: string) {
    const userSession = await this.userSessionRepo.findOne({
      where: { id },
      relations: ['user', 'training_session', 'questions'],
    });

    return userSession;
  }

  update(id: number, updateSessionDto: UpdateSessionDto) {
    return `This action updates a #${id} session`;
  }

  async removeTrainingSession(id: string) {
    const training = await this.findOneTrainingSession(id);
    if (!training) throw new NotFoundException('Training not found');

    await this.trainingRepo.delete(id);
    return `Training ${id} deleted`;
  }

  async removeUserSession(id: string) {
    const session = await this.findOneUserSession(id);
    if (!session) throw new NotFoundException('User session not found');

    await this.userSessionRepo.delete(id);
    return `User session ${id} deleted`;
  }
}
