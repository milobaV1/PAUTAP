import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdatePasswordDto,
  VerifyPasswordDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import {
  AdminStatsUserResponse,
  DashboardResponse,
} from 'src/core/interfaces/user.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SystemAdminOnly } from 'src/core/metadata/role.metadata';

@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SystemAdminOnly()
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Registers a new user in the system with a role assigned.',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @SystemAdminOnly()
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk insert users' })
  @ApiResponse({ status: 201, description: 'Users created successfully' })
  async bulkCreate(@Body() createUserDtos: CreateUserDto[]) {
    return this.usersService.bulkCreate(createUserDtos);
  }

  @SystemAdminOnly()
  @Post('/create-department')
  @ApiOperation({
    summary: 'Create a new department',
    description: 'Registers a new department in the system.',
  })
  @ApiResponse({
    status: 201,
    description: 'Department successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.usersService.createDepartment(createDepartmentDto);
  }

  @SystemAdminOnly()
  @Post('/create-role')
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Adds a new role and assigns it to a department.',
  })
  @ApiResponse({
    status: 201,
    description: 'Role successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.usersService.createRole(createRoleDto);
  }

  @Get()
  getAllRoles() {
    return this.usersService.getAllRoles();
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Successfully fetched the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findUserById(@Param('id') id: string) {
    const user = await this.usersService.findOne('id', id);
    if (!user) {
      return null;
    }
    // Exclude password from the returned user object
    const { password, ...rest } = user;
    return rest;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('/dashboard/:userId')
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'UUID of the user',
    example: '2f5e3f52-1a1d-4c36-9f70-2d7e22b998a4',
  })
  async getDashboard(
    @Param('userId') userId: string,
  ): Promise<DashboardResponse> {
    return this.usersService.getUserDashboard(userId);
  }

  @SystemAdminOnly()
  @Get('/admin/stats')
  async getAdminStatsUser(
    @Query('page') page = '1',
    @Query('limit') limit = '5',
  ): Promise<AdminStatsUserResponse> {
    return this.usersService.getAdminStatsUser(Number(page), Number(limit));
  }

  @Patch(':id/update-password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID whose password is to be updated',
  })
  @ApiBody({
    description: 'New password payload',
    type: UpdatePasswordDto,
  })
  @ApiResponse({ status: 204, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePassword(
    @Param('id') id: string,
    @Body() body: UpdatePasswordDto,
  ): Promise<void> {
    await this.usersService.updatePassword(id, body.newPassword);
  }

  @Post(':id/verify-password')
  @ApiOperation({ summary: 'Verify user password' })
  @ApiResponse({
    status: 200,
    description: 'Password verification result',
    schema: {
      example: { isValid: true },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyPassword(
    @Param('id') id: string,
    @Body() body: VerifyPasswordDto,
  ): Promise<{ isValid: boolean }> {
    const isValid = await this.usersService.verifyPassword(id, body.password);
    return { isValid };
  }
}
