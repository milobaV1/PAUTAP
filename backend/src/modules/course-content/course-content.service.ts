import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseContentDto } from './dto/create-course-content.dto';
import { UpdateCourseContentDto } from './dto/update-course-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseContent } from './entities/course-content.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseContentService {
  constructor(
    @InjectRepository(CourseContent)
    private courseRepo: Repository<CourseContent>,
  ) {}
  async create(createCourseContentDto: CreateCourseContentDto) {
    const course = this.courseRepo.create(createCourseContentDto);
    return await this.courseRepo.save(course);
  }

  async findAll() {
    const courses = await this.courseRepo.find({
      relations: ['course_progress'],
    });
    return courses;
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['course_progress'],
    });
    return course;
  }

  update(id: number, updateCourseContentDto: UpdateCourseContentDto) {
    return `This action updates a #${id} courseContent`;
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    if (!course) throw new BadRequestException('Course not found');
    await this.courseRepo.delete(id);
    return `Course ${id} deleted`;
  }
}
