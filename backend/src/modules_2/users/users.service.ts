import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
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

  async findAll() {
    const users = await this.userRepo.find({
      relations: ['sessions', 'certificates'],
    });
    return users;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await this.findOne('id', id);
    if (!user) throw new BadRequestException('User not found');
    await this.userRepo.delete(id);
    return `User ${id} deleted`;
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
      relations: ['user'],
    });

    return roles;
  }

  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
}
