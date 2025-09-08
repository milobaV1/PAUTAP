import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Computer Science',
    description: 'Name of the department',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
