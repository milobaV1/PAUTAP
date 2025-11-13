import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserDetailsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsPage?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsLimit?: number = 5;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  certificatesPage?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  certificatesLimit?: number = 5;

  @IsOptional()
  @IsString()
  sessionsStartDate?: string;

  @IsOptional()
  @IsString()
  sessionsEndDate?: string;

  @IsOptional()
  @IsString()
  certificatesStartDate?: string;

  @IsOptional()
  @IsString()
  certificatesEndDate?: string;
}
