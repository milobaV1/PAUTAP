import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { CertificateService } from './certificate.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

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

  @Get('user/:userId')
  async getUserCertificates(@Param('userId') userId: string) {
    return await this.certificateService.getUserCertificatesWithDetails(userId);
  }
}
