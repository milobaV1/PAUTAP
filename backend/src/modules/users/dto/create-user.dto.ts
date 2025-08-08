import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is onboarding',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_onboarding?: boolean;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password for the user account',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'a23e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the assigned role',
  })
  @IsNotEmpty()
  @IsUUID()
  role_id: string;
}
