import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
  Body,
  UploadedFile,
  BadRequestException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { CertificateService } from './certificate.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CertificateSource } from 'src/core/enums/certificate.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@ApiBearerAuth('access-token')
@Controller('certificates')
@UseGuards(RolesGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.certificateService.findOneCertificate(id);
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const cert = await this.certificateService.findOneCertificate(id);
    if (!cert) throw new NotFoundException('Certificate not found');
    res.download(cert.filePath);
  }

  @Post('upload/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadCertificate(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCertificateDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return await this.certificateService.uploadExternalCertificate(
      userId,
      file,
      dto,
    );
  }

  @Get('user/:userId')
  async getUserCertificates(@Param('userId') userId: string) {
    return await this.certificateService.getUserCertificatesWithDetails(userId);
  }

  @Get('user/:userId/internal')
  async getUserInternalCertificates(@Param('userId') userId: string) {
    return await this.certificateService.getUserCertificatesWithDetails(
      userId,
      CertificateSource.INTERNAL,
    );
  }

  @Get('user/:userId/external')
  async getUserExternalCertificates(@Param('userId') userId: string) {
    return await this.certificateService.getUserCertificatesWithDetails(
      userId,
      CertificateSource.EXTERNAL,
    );
  }
}
