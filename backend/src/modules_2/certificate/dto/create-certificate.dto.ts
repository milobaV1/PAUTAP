import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  title: string; // e.g., "Advanced Python Programming"

  @IsOptional()
  @IsString()
  issuedBy?: string; // e.g., "Udemy", "Coursera", "Google"

  @IsOptional()
  @IsDateString()
  issuedDate?: string; // ISO 8601 format
}
