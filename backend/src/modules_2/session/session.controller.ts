import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SessionService } from './session.service';
import {
  CompleteSessionDto,
  CreateSessionDto,
  StartSessionDto,
  SyncSessionDto,
} from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  createSession(createSessionDto: CreateSessionDto) {
    return this.sessionService.createSession(createSessionDto);
  }

  @Post(':id')
  startOrResumeSession(
    @Param(':id') id: string,
    @Body() startSessionDto: StartSessionDto,
  ) {
    return this.sessionService.startOrResumeSession(id, startSessionDto);
  }

  @Post()
  syncProgress(
    @Param(':id') id: string,
    @Body() syncSessionDto: SyncSessionDto,
  ) {
    return this.sessionService.syncUserProgress(id, syncSessionDto);
  }

  @Post()
  completeSession(
    @Param(':id') id: string,
    @Body() completeSessionDto: CompleteSessionDto,
  ) {
    return this.sessionService.completeSession(id, completeSessionDto);
  }

  // @Get()
  // getProgress(@Param(':id') id: string)
  // {return this.sessionService.}
}
