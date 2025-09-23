import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiBearerAuth,
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

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  findUserById(@Param('id') id: string) {
    return this.usersService.findOne('id', id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // console.log('Data from update backend: ', updateUserDto);
    // console.log('id from update backend: ', id);
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
  // @ApiOkResponse({
  //   description: 'User dashboard data fetched successfully',
  //   type: DashboardResponse,
  // })
  async getDashboard(
    @Param('userId') userId: string,
  ): Promise<DashboardResponse> {
    return this.usersService.getUserDashboard(userId);
  }

  @Get('/admin/stats')
  async getAdminStatsUser(
    @Query('page') page = '1',
    @Query('limit') limit = '5',
  ): Promise<AdminStatsUserResponse> {
    return this.usersService.getAdminStatsUser(Number(page), Number(limit));
  }
}
