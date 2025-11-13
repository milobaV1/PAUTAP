import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Instructor',
    description: 'Name of the role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the department the role belongs to',
  })
  @IsNumber()
  @IsNotEmpty()
  departmentId: number;
}

export class RoleDto {
  @ApiProperty({
    example: 'a23e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the assigned role',
  })
  @IsNotEmpty()
  @IsNumber()
  role_id: number;
}
