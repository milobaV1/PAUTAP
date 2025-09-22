import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SessionService } from './session.service';
import {
  CompleteSessionDto,
  CreateSessionDto,
  RetakeSessionDto,
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
import { AdminSessionsResponse } from 'src/core/interfaces/session.interface';

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

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get all sessions for admin with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of sessions with stats',
    type: Object,
  })
  async getAdminSessions(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ): Promise<AdminSessionsResponse> {
    return this.sessionService.getAdminSessions(Number(page), Number(limit));
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

  @Post(':sessionId/reset-progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user progress for a session' })
  @ApiResponse({ status: 200, description: 'Progress reset successfully' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async resetUserProgress(
    @Param('sessionId') sessionId: string,
    @Body() dto: RetakeSessionDto,
  ) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    try {
      console.log('Retake 1: ', dto);
      console.log('Retake 2: ', sessionId);
      const result = await this.sessionService.resetUserProgress(
        sessionId,
        dto,
      );

      return {
        success: true,
        message: 'User progress reset successfully',
        data: result,
      };
    } catch (error) {
      if (error.message === 'Progress not found') {
        throw new NotFoundException('User progress not found for this session');
      }
      throw new BadRequestException(
        error.message || 'Failed to reset user progress',
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a session by ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID of the session' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.sessionService.remove(id);
  }
}
