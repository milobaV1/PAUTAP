import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SessionService } from './session.service';
import {
  CompleteSessionDto,
  CreateSessionDto,
  StartSessionDto,
  SyncSessionDto,
} from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from 'src/core/metadata/public.metadata';

@ApiBearerAuth('access-token')
@ApiTags('Sessions')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session successfully created' })
  createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.createSession(createSessionDto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start or resume a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session started or resumed' })
  startOrResumeSession(
    @Param('id') id: string,
    @Body() startSessionDto: StartSessionDto,
  ) {
    console.log('API call went through: ', startSessionDto);
    return this.sessionService.startOrResumeSession(id, startSessionDto);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync user progress in a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Progress synced successfully' })
  syncProgress(
    @Param('id') id: string,
    @Body() syncSessionDto: SyncSessionDto,
  ) {
    console.log('Sync Data Received: ', syncSessionDto);
    return this.sessionService.syncUserProgress(id, syncSessionDto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session completed successfully' })
  completeSession(
    @Param('id') id: string,
    @Body() completeSessionDto: CompleteSessionDto,
  ) {
    return this.sessionService.completeSession(id, completeSessionDto);
  }

  @Get('user/:userId/statuses')
  @ApiOperation({
    summary: 'Get all active sessions for a user with their statuses',
  })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiQuery({
    name: 'userRoleId',
    required: true,
    description: 'Role ID of the user to filter sessions',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of session progress objects',
  })
  async getUserSessionWithStatuses(
    @Param('userId') userId: string,
    @Query('userRoleId') userRoleId: number,
  ) {
    const sessionStatuses =
      await this.sessionService.getUserSessionWithStatuses(userId, userRoleId);
    return sessionStatuses;
  }
  // You can also add a GET endpoint to fetch session progress, etc.

  @Patch(':sessionId/status')
  async updateSessionStatus(
    @Param('sessionId') sessionId: string,
    @Body() body: { userId: string; status: string },
  ) {
    const { userId, status } = body;
    console.log('Received payload for updating status: ', body);
    return await this.sessionService.updateSessionStatus(
      sessionId,
      userId,
      status,
    );
  }

  // Optional: Add endpoint to get current progress
  @Get(':sessionId/progress/:userId')
  async getSessionProgress(
    @Param('sessionId') sessionId: string,
    @Param('userId') userId: string,
  ) {
    return await this.sessionService.getProgressSummary(userId, sessionId);
  }
}
