import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { CertificateService } from './certificate.service';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.certificateService.findOneCertificate(id);
  }

  // @Get('user/:userId')
  // async getUserCertificates(@Param('userId') userId: string) {
  //   return await this.certificateService.getUserCertificates(userId);
  // }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const cert = await this.certificateService.findOneCertificate(id);
    if (!cert) throw new NotFoundException('Certificate not found');

    //const filePath = join(__dirname, '../..', 'certificates', `${id}.pdf`);
    // const filePath = join(
    //   process.cwd(),
    //   'uploads',
    //   'certificates',
    //   `${cert.certificateId}.pdf`,
    // );
    res.download(cert.filePath);
  }

  @Get('user/:userId')
  async getUserCertificates(@Param('userId') userId: string) {
    return await this.certificateService.getUserCertificatesWithDetails(userId);
  }
}
