import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminDashboardStats } from 'src/core/interfaces/admin.interface';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/dashboard/stats')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description:
      'Retrieves comprehensive statistics for the admin dashboard including user counts, session data, certificates issued, and completion rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: {
          type: 'number',
          description: 'Total number of registered users',
          example: 150,
        },
        totalSessions: {
          type: 'number',
          description: 'Total number of active training sessions',
          example: 12,
        },
        totalCertificatesIssued: {
          type: 'number',
          description: 'Total number of certificates issued',
          example: 85,
        },
        overallCompletionRate: {
          type: 'number',
          description: 'Overall completion rate percentage across all sessions',
          example: 72.5,
        },
        sessions: {
          type: 'array',
          description: 'Detailed statistics for each session',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Session UUID',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              title: {
                type: 'string',
                description: 'Session title',
                example: 'CRISP Methodology Training',
              },
              description: {
                type: 'string',
                description: 'Session description',
                example:
                  'Comprehensive training on CRISP methodology for data mining',
              },
              completionRate: {
                type: 'number',
                description: 'Completion rate percentage for this session',
                example: 85.7,
              },
              totalEnrolled: {
                type: 'number',
                description: 'Total number of users enrolled in this session',
                example: 45,
              },
              totalCompleted: {
                type: 'number',
                description: 'Total number of users who completed this session',
                example: 38,
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions (Admin access required)',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getDashboardStats(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ): Promise<AdminDashboardStats> {
    return await this.adminService.getDashboardStats(page, limit);
  }
}
