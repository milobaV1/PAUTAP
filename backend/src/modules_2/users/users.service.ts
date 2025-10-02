import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Not,
  Repository,
} from 'typeorm';
import { Department } from './entities/department.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoleDto } from './dto/create-role.dto';
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
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(UserSessionProgress)
    private readonly progressRepo: Repository<UserSessionProgress>,
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(TriviaParticipation)
    private readonly triviaParticipationRepo: Repository<TriviaParticipation>,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
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
      const generatedPassword = this.generatePassword();

      const user = this.userRepo.create({
        ...rest,
        role,
        password: generatedPassword,
      });
      const savedUser = await this.userRepo.save(user);

      // Send email with credentials
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      await this.emailQueue.add(
        'send credentials',
        {
          to: savedUser.email,
          subject: '🎉 Welcome to PAU Training Application',
          html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9fafb;
                color: #2e3f6f;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 22px;
                margin-bottom: 20px;
                text-align: center;
                color: #2e3f6f;
              }
              p {
                font-size: 16px;
                line-height: 1.5;
                color: #444;
              }
              .credentials {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .credentials p {
                margin: 8px 0;
              }
              .credentials strong {
                color: #2e3f6f;
              }
              .button {
                display: inline-block;
                padding: 12px 20px;
                margin-top: 20px;
                background-color: #2e3f6f;
                color: #ffffff !important;
                text-decoration: none;
                font-weight: bold;
                border-radius: 6px;
              }
              .warning {
                background-color: #fef3c7;
                padding: 12px;
                border-left: 4px solid #f59e0b;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to PAU Training Application! 🎉</h1>
              <p>Hi ${savedUser.first_name || 'there'},</p>
              <p>
                Your account has been successfully created. Below are your login credentials:
              </p>
              
              <div class="credentials">
                <p><strong>Email:</strong> ${savedUser.email}</p>
                <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
              </div>

              <div class="warning">
                <p style="margin: 0; color: #92400e;">
                  ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
                </p>
              </div>

              <p style="text-align: center;">
                <a href="${frontendUrl}/login" class="button">Login Now</a>
              </p>
              
              <div class="footer">
                <p>If you did not expect this email, please contact your administrator.</p>
                <p>This is an automated message from PAU Training Application.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      );

      return `User ${savedUser.id} has been created and credentials sent to ${savedUser.email}`;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          `User with email: ${createUserDto.email} already exists`,
        );
      }
      throw error;
    }
  }

  async bulkCreate(createUserDtos: CreateUserDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usersToCreate: Array<{
        userData: {
          email: string;
          password: string;
          role: Role;
          first_name: string;
          last_name: string;
          is_onboarding?: boolean;
        };
        plainPassword: string;
        email: string;
        firstName: string;
      }> = [];
      const emailJobs = [];
      const errors: Array<{ index: number; email: string; error: string }> = []; // Add explicit type here

      // Validate all users first
      for (let i = 0; i < createUserDtos.length; i++) {
        const dto = createUserDtos[i];

        try {
          // Check if user already exists
          const existingUser = await queryRunner.manager.findOne(User, {
            where: { email: dto.email },
          });

          if (existingUser) {
            errors.push({
              index: i,
              email: dto.email,
              error: `User with email ${dto.email} already exists`,
            });
            continue;
          }

          // Check if role exists
          const role = await queryRunner.manager.findOne(Role, {
            where: { id: dto.role_id },
          });

          if (!role) {
            errors.push({
              index: i,
              email: dto.email,
              error: `Role with id ${dto.role_id} not found`,
            });
            continue;
          }

          // Generate password
          const generatedPassword = this.generatePassword();
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);

          const { role_id, ...rest } = dto;

          // Prepare user data
          usersToCreate.push({
            userData: {
              ...rest,
              email: rest.email.toLowerCase().trim(),
              password: hashedPassword,
              role,
            },
            plainPassword: generatedPassword,
            email: rest.email,
            firstName: rest.first_name,
          });
        } catch (error) {
          errors.push({
            index: i,
            email: dto.email,
            error: error.message,
          });
        }
      }

      // Bulk insert users
      const savedUsers: Array<User & { plainPassword: string }> = [];
      if (usersToCreate.length > 0) {
        for (const userInfo of usersToCreate) {
          const user = queryRunner.manager.create(User, userInfo.userData);
          const savedUser = await queryRunner.manager.save(User, user);
          savedUsers.push({
            ...savedUser,
            plainPassword: userInfo.plainPassword,
            hashPassword: function (): Promise<void> {
              throw new Error('Function not implemented.');
            },
            hashNewPassword: function (): Promise<void> {
              throw new Error('Function not implemented.');
            },
            department: new Department(),
          });
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Send emails after successful transaction
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      const emailJobsData = savedUsers.map((user) => ({
        name: 'send credentials',
        data: {
          to: user.email,
          subject: '🎉 Welcome to PAU Training Application',
          html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9fafb;
                color: #2e3f6f;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
              h1 {
                font-size: 22px;
                margin-bottom: 20px;
                text-align: center;
                color: #2e3f6f;
              }
              p {
                font-size: 16px;
                line-height: 1.5;
                color: #444;
              }
              .credentials {
                background-color: #f3f4f6;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .credentials p {
                margin: 8px 0;
              }
              .credentials strong {
                color: #2e3f6f;
              }
              .button {
                display: inline-block;
                padding: 12px 20px;
                margin-top: 20px;
                background-color: #2e3f6f;
                color: #ffffff !important;
                text-decoration: none;
                font-weight: bold;
                border-radius: 6px;
              }
              .warning {
                background-color: #fef3c7;
                padding: 12px;
                border-left: 4px solid #f59e0b;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to PAU Training Application! 🎉</h1>
              <p>Hi ${user.first_name || 'there'},</p>
              <p>
                Your account has been successfully created. Below are your login credentials:
              </p>
              
              <div class="credentials">
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Temporary Password:</strong> ${user.plainPassword}</p>
              </div>

              <div class="warning">
                <p style="margin: 0; color: #92400e;">
                  ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
                </p>
              </div>

              <p style="text-align: center;">
                <a href="${frontendUrl}/login" class="button">Login Now</a>
              </p>
              
              <div class="footer">
                <p>If you did not expect this email, please contact your administrator.</p>
                <p>This is an automated message from PAU Training Application.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      }));

      // Send all emails in bulk
      if (emailJobsData.length > 0) {
        await this.emailQueue.addBulk(emailJobsData);
      }

      return {
        success: true,
        created: savedUsers.length,
        failed: errors.length,
        users: savedUsers.map((u) => ({
          id: u.id,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
        })),
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Bulk user creation failed: ${error.message}`,
      );
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
  private generatePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
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
      relations: ['users'],
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
  private async findById(id: string, include_relations = true): Promise<User> {
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
  private async findByEmail(
    email: string,
    include_relations = true,
  ): Promise<User> {
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
  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    console.log('Data from update service: ', updateUserDto);
    console.log('id from update service: ', id);
    const user = await this.findById(id, true);

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
    //return this.findById(id);
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findById(id, false);

    // Hash the new password manually
    user.password = await bcrypt.hash(newPassword.trim(), 10);

    await this.userRepo.save(user, { reload: false });

    //return this.findById(id);
  }

  /**
   * Update user level
   */

  /**
   * Complete onboarding
   */
  async completeOnboarding(id: string): Promise<void> {
    const user = await this.findById(id, false);
    user.is_onboarding = false;
    await this.userRepo.save(user);
    //return this.findById(id);
  }

  /**
   * Set reset token
   */
  async setResetToken(id: string, resetToken: string): Promise<void> {
    const user = await this.findById(id, false);
    user.resetToken = resetToken;
    await this.userRepo.save(user);
    //return this.findById(id);
  }

  /**
   * Clear reset token
   */

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
    const users = await this.userRepo.find({
      where: { id: In(ids) },
    });

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

    return {
      total,
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

    return {
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      },
      completedSessions,
      triviaScore,
      certificatesCount,
    };
  }

  async getAdminStatsUser(
    page = 1,
    limit = 5,
  ): Promise<AdminStatsUserResponse> {
    // total users
    const totalUsers = await this.userRepo.count();

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
        'user.first_name',
        'user.last_name',
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
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      createdAt: u.created_at,
      role: u.role?.name || 'N/A',
      department: u.role?.department?.name || 'N/A',
      totalCertificates: u.totalCertificates || 0,
    }));
    console.log('Formatted Users: ', formattedUsers);

    return {
      totalUsers,
      totalCertificates,
      users: formattedUsers,
      page,
      limit,
    };
  }
}
