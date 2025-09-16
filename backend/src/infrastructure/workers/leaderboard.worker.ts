// workers/leaderboard.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('leaderboard')
export class LeaderboardProcessor extends WorkerHost {
  async process(job: Job<any>) {
    console.log('🏆 Recomputing leaderboard...');
    // Fetch scores from DB, compute ranks, update cache/DB
    // await this.leaderboardService.recompute();
    return { success: true };
  }
}
