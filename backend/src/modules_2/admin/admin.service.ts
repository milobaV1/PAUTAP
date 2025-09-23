import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules_2/users/entities/user.entity';
import { Session } from 'src/modules_2/session/entities/session.entity';
import { Certificate } from 'src/modules_2/certificate/entities/certificate.entity';
import { UserSessionProgress } from 'src/modules_2/session/entities/user-session-progress.entity';
import {
  AdminDashboardStats,
  SessionStats,
} from 'src/core/interfaces/admin.interface';
import { ProgressStatus } from 'src/core/enums/user.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,

    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,

    @InjectRepository(UserSessionProgress)
    private userSessionProgressRepository: Repository<UserSessionProgress>,
  ) {}

  async getDashboardStats(
    page: number = 1,
    limit: number = 5,
  ): Promise<AdminDashboardStats> {
    const [
      totalUsers,
      totalSessions,
      totalCertificatesIssued,
      overallCompletionRate,
      sessions,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalSessions(),
      this.getTotalCertificatesIssued(),
      this.getOverallCompletionRate(),
      this.getSessionsStats(page, limit),
    ]);

    return {
      totalUsers,
      totalSessions,
      totalCertificatesIssued,
      overallCompletionRate,
      sessions,
      page,
      limit,
    };
  }

  private async getTotalUsers(): Promise<number> {
    return await this.userRepository.count();
  }

  private async getTotalSessions(): Promise<number> {
    return await this.sessionRepository.count({ where: { isActive: true } });
  }

  private async getTotalCertificatesIssued(): Promise<number> {
    return await this.certificateRepository.count();
  }

  private async getOverallCompletionRate(): Promise<number> {
    const totalProgress = await this.userSessionProgressRepository.count();
    const completedProgress = await this.userSessionProgressRepository.count({
      where: { status: ProgressStatus.COMPLETED },
    });

    return totalProgress > 0
      ? Math.round((completedProgress / totalProgress) * 100 * 100) / 100
      : 0;
  }

  private async getSessionsStats(
    page: number = 1,
    limit: number = 5,
  ): Promise<SessionStats[]> {
    const skip = (page - 1) * limit;

    const sessions = await this.sessionRepository.find({
      where: { isActive: true },
      select: ['id', 'title', 'description'],
      skip,
      take: limit,
    });

    const sessionStats = await Promise.all(
      sessions.map(async (session) => {
        const totalEnrolled = await this.userSessionProgressRepository.count({
          where: { sessionId: session.id },
        });

        const totalCompleted = await this.userSessionProgressRepository.count({
          where: {
            sessionId: session.id,
            status: ProgressStatus.COMPLETED,
          },
        });

        const completionRate =
          totalEnrolled > 0
            ? Math.round((totalCompleted / totalEnrolled) * 100 * 100) / 100
            : 0;

        return {
          id: session.id,
          title: session.title,
          description: session.description || '',
          completionRate,
          totalEnrolled,
          totalCompleted,
        };
      }),
    );

    return sessionStats.sort((a, b) => b.completionRate - a.completionRate);
    //total,
  }
}
