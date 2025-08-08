import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create-user')
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
  findAll() {
    return this.usersService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
