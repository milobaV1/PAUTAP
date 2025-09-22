import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Not, Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoleDto } from './dto/create-role.dto';
//import { Difficulty } from 'src/core/enums/question.enum';
import * as bcrypt from 'bcrypt';
import {
  AdminStatsUserResponse,
  UserQueryOptions,
  UserWithStats,
} from 'src/core/interfaces/user.interface';
import { ProgressStatus } from 'src/core/enums/user.enum';
import { UserSessionProgress } from '../session/entities/user-session-progress.entity';
import { TriviaParticipation } from '../trivia/entities/trivia-participation.entity';
import { Certificate } from '../certificate/entities/certificate.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(UserSessionProgress)
    private readonly progressRepo: Repository<UserSessionProgress>,

    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,

    @InjectRepository(TriviaParticipation)
    private readonly triviaParticipationRepo: Repository<TriviaParticipation>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { role_id, ...rest } = createUserDto;
    try {
      const existingUser = await this.findOne('email', createUserDto.email);
      if (existingUser) {
        throw new BadRequestException(
          `User with email: ${createUserDto.email} exists`,
        );
      }

      const role = await this.roleRepo.findOne({ where: { id: role_id } });
      if (!role) {
        throw new NotFoundException(`Role with id ${role_id} not found`);
      }

      const user = this.userRepo.create({ ...rest, role });
      const savedUser = await this.userRepo.save(user);

      return `User ${savedUser.id} has been created`;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          `User with email: ${createUserDto.email} already exists`,
        );
      }
      throw error;
    }
  }

  // async findAll() {
  //   const users = await this.userRepo.find({
  //     relations: ['role', 'certificates'],
  //   });
  //   return users;
  // }

  async findOne(searchParam: 'id' | 'email', searchValue: string) {
    const user = await this.userRepo.findOne({
      where: { [searchParam]: searchValue },
      relations: [
        //'sessions',
        'role',
        'certificates',
      ],
    });
    return user;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // async remove(id: string) {
  //   const user = await this.findOne('id', id);
  //   if (!user) throw new BadRequestException('User not found');
  //   await this.userRepo.delete(id);
  //   return `User ${id} deleted`;
  // }

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.deptRepo.findOne({
      where: { name: createDepartmentDto.name },
    });
    if (existingDepartment)
      throw new BadRequestException(
        `${createDepartmentDto.name} department exists`,
      );
    const department = this.deptRepo.create(createDepartmentDto);
    const savedDepartment = await this.deptRepo.save(department);
    return `${savedDepartment.name} created`;
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { departmentId, ...rest } = createRoleDto;
    const department = await this.deptRepo.findOne({
      where: { id: departmentId },
    });
    if (!department)
      throw new NotFoundException(
        `Department with id ${departmentId} not found`,
      );
    const existingRole = await this.roleRepo.findOne({
      where: { name: createRoleDto.name },
    });
    if (existingRole)
      throw new BadRequestException(`${createRoleDto.name} role exists`);

    const role = this.roleRepo.create({
      ...rest,
      department,
    });
    const savedRole = await this.roleRepo.save(role);
    return `${savedRole.name} role created`;
  }

  async getAllRoles() {
    const roles = await this.roleRepo.find({
      relations: ['user'],
    });

    return roles;
  }

  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }

  /**
   * Find all users with optional filtering and pagination
   */
  async findAll(options: UserQueryOptions = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      role_id,
      department_id,
      //level,
      is_onboarding,
      include_relations = true,
    } = options;

    const queryBuilder = this.userRepo.createQueryBuilder('user');

    // Add relations
    if (include_relations) {
      queryBuilder
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.department', 'department')
        .leftJoinAndSelect('user.question_history', 'question_history')
        .leftJoinAndSelect('user.certificates', 'certificates')
        .leftJoinAndSelect('user.leaderboard', 'leaderboard');
    }

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Add filters
    if (role_id) {
      queryBuilder.andWhere('user.role_id = :role_id', { role_id });
    }

    if (department_id) {
      queryBuilder.andWhere('role.department_id = :department_id', {
        department_id,
      });
    }

    // if (level) {
    //   queryBuilder.andWhere('user.level = :level', { level });
    // }

    if (typeof is_onboarding === 'boolean') {
      queryBuilder.andWhere('user.is_onboarding = :is_onboarding', {
        is_onboarding,
      });
    }

    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Add ordering
    queryBuilder.orderBy('user.created_at', 'DESC');

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find user by ID
   */
  async findById(id: string, include_relations = true): Promise<User> {
    const relations = include_relations
      ? [
          'role',
          'role.department',
          'question_history',
          'certificates',
          'leaderboard',
        ]
      : [];

    const user = await this.userRepo.findOne({
      where: { id },
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, include_relations = true): Promise<User> {
    const relations = include_relations
      ? [
          'role',
          'role.department',
          'question_history',
          'certificates',
          'leaderboard',
        ]
      : [];

    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase().trim() },
      relations,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find users by role
   */
  async findByRole(role_id: number, include_relations = true): Promise<User[]> {
    const relations = include_relations
      ? [
          'role',
          'role.department',
          'question_history',
          'certificates',
          'leaderboard',
        ]
      : ['role'];

    return this.userRepo.find({
      where: { role: { id: role_id } },
      relations,
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find users by department
   */
  async findByDepartment(
    department_id: number,
    include_relations = true,
  ): Promise<User[]> {
    const relations = include_relations
      ? [
          'role',
          'role.department',
          'question_history',
          'certificates',
          'leaderboard',
        ]
      : ['role', 'role.department'];

    return this.userRepo.find({
      where: { role: { department: { id: department_id } } },
      relations,
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id, false);

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email.toLowerCase().trim() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Validate role if role_id is being updated
    if (updateUserDto.role_id && updateUserDto.role_id !== user.role.id) {
      const role = await this.roleRepo.findOne({
        where: { id: updateUserDto.role_id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      user.role = role;
    }

    // Update user properties
    Object.assign(user, updateUserDto);

    // If password is being updated, it will be hashed by @BeforeUpdate hook
    await this.userRepo.save(user);

    // Return updated user with relations
    return this.findById(id);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findById(id, false);

    // Hash the new password manually
    user.password = await bcrypt.hash(newPassword.trim(), 10);

    await this.userRepo.save(user, { reload: false });

    return this.findById(id);
  }

  /**
   * Update user level
   */
  // async updateLevel(id: string, level: Difficulty): Promise<User> {
  //   const user = await this.findById(id, false);
  //   user.level = level;
  //   await this.userRepo.save(user);
  //   return this.findById(id);
  // }

  /**
   * Complete onboarding
   */
  async completeOnboarding(id: string): Promise<User> {
    const user = await this.findById(id, false);
    user.is_onboarding = false;
    await this.userRepo.save(user);
    return this.findById(id);
  }

  /**
   * Set reset token
   */
  async setResetToken(id: string, resetToken: string): Promise<User> {
    const user = await this.findById(id, false);
    user.resetToken = resetToken;
    await this.userRepo.save(user);
    return this.findById(id);
  }

  /**
   * Clear reset token
   */
  // async clearResetToken(id: string): Promise<User> {
  //   const user = await this.findById(id, false);
  //   user.resetToken = null;
  //   await this.userRepo.save(user);
  //   return this.findById(id);
  // }

  /**
   * Soft delete user (mark as inactive or add deleted_at field)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id, false);

    try {
      await this.userRepo.remove(user);
    } catch (error) {
      // If there are foreign key constraints, you might want to implement soft delete instead
      throw new BadRequestException(
        'Cannot delete user due to existing relationships',
      );
    }
  }

  /**
   * Bulk delete users
   */
  async bulkRemove(ids: string[]): Promise<void> {
    const users = await this.userRepo.findByIds(ids);

    if (users.length !== ids.length) {
      throw new NotFoundException('Some users not found');
    }

    try {
      await this.userRepo.remove(users);
    } catch (error) {
      throw new BadRequestException(
        'Cannot delete users due to existing relationships',
      );
    }
  }

  /**
   * Count users by criteria
   */
  async count(criteria: FindOptionsWhere<User> = {}): Promise<number> {
    return this.userRepo.count({ where: criteria });
  }

  /**
   * Count users by role
   */
  async countByRole(role_id: number): Promise<number> {
    return this.userRepo.count({
      where: { role: { id: role_id } },
    });
  }

  /**
   * Count users by department
   */
  async countByDepartment(department_id: number): Promise<number> {
    return this.userRepo.count({
      where: { role: { department: { id: department_id } } },
    });
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<{
    total: number;
    //byLevel: Record<Difficulty, number>;
    onboarding: number;
    completed: number;
  }> {
    const total = await this.userRepo.count();
    const onboarding = await this.userRepo.count({
      where: { is_onboarding: true },
    });
    const completed = await this.userRepo.count({
      where: { is_onboarding: false },
    });

    // const byLevel = {} as Record<Difficulty, number>;
    // for (const level of Object.values(Difficulty)) {
    //   byLevel[level] = await this.userRepo.count({ where: { level } });
    // }

    return {
      total,
      //byLevel,
      onboarding,
      completed,
    };
  }

  /**
   * Verify user password
   */
  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.findById(id, false);
    return bcrypt.compare(password, user.password);
  }

  /**
   * Find users with pagination and search
   */
  async findAndCount(
    options: FindManyOptions<User> = {},
  ): Promise<[User[], number]> {
    return this.userRepo.findAndCount({
      relations: ['role', 'role.department'],
      order: { created_at: 'DESC' },
      ...options,
    });
  }

  async getUserDashboard(userId: string) {
    // 1. User details
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'first_name', 'last_name', 'email'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Completed sessions count
    const completedSessions = await this.progressRepo.count({
      where: { userId, status: ProgressStatus.COMPLETED },
    });

    // 3. Trivia score (sum)
    const triviaResult = await this.triviaParticipationRepo
      .createQueryBuilder('tp')
      .select('SUM(tp.score)', 'totalScore')
      .where('tp.userId = :userId', { userId })
      .getRawOne<{ totalScore: string }>();

    const triviaScore = parseInt(triviaResult?.totalScore || '0', 10);

    // 4. Certificates count
    const certificatesCount = await this.certificateRepo.count({
      where: { userId },
    });

    // 5. Incomplete sessions with progress
    // const incompleteSessions = await this.progressRepo.find({
    //   where: { userId, status: Not(ProgressStatus.COMPLETED) },
    //   relations: ['session'],
    // });

    return {
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      },
      completedSessions,
      triviaScore,
      certificatesCount,
      // incompleteSessions: incompleteSessions.map((p) => ({
      //   sessionId: p.sessionId,
      //   sessionTitle: p.session?.title,
      //   status: p.status,
      //   progress: {
      //     answered: p.answeredQuestions,
      //     total: p.totalQuestions,
      //     percentage: p.getProgressPercentage(),
      //   },
      // })),
    };
  }

  async getAdminStatsUser(
    page = 1,
    limit = 5,
  ): Promise<AdminStatsUserResponse> {
    // total users
    const totalUsers = await this.userRepo.count();

    // total active users (still onboarding = true or false? Assuming active = !is_onboarding)
    //const totalActiveUsers = await this.userRepo.count({ where: { is_onboarding: false } });

    // total certificates
    const totalCertificates = await this.certificateRepo.count();

    // users with details + cert count
    const users = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.department', 'department')
      .leftJoin('user.certificates', 'certificate')
      .loadRelationCountAndMap('user.totalCertificates', 'user.certificates')
      .select([
        'user.id',
        'user.email',
        'user.created_at',
        'role.name',
        'department.name',
      ])
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const formattedUsers: UserWithStats[] = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      createdAt: u.created_at,
      role: u.role?.name || 'N/A',
      department: u.role?.department?.name || 'N/A',
      totalCertificates: u.totalCertificates || 0,
    }));

    return {
      totalUsers,
      //totalActiveUsers,
      totalCertificates,
      users: formattedUsers,
      page,
      limit,
    };
  }
}
