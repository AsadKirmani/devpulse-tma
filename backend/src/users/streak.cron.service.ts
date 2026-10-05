import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

@Injectable()
export class StreakCronService {
  private readonly logger = new Logger(StreakCronService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Automatically fires at 00:00 (Midnight) every day
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async verifyDailyDeveloperStreaks() {
    this.logger.log('Starting global GitHub daily streak validation sequence...');
    
    // Fetch all developers who have successfully linked a GitHub account
    const developers = await this.userRepo.find({
      where: { github_username: Not(IsNull()) } // TypeORM notation for Not(IsNull()) or basic raw filter
    });

    const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    for (const dev of developers) {
      if (!dev.github_access_token) continue;

      try {
        // Query the GitHub search API to find commits authored by this user today
        const githubResponse = await axios.get(
          `https://api.github.com/search/commits?q=author:${dev.github_username}+committer-date:${todayStr}`,
          {
            headers: {
              Authorization: `token ${dev.github_access_token}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'DevPulse-TMA-Backend',
            },
          },
        );

        const totalCommitsToday = githubResponse.data?.total_count || 0;

        if (totalCommitsToday > 0) {
          // 🚀 Developer committed code today! Increment active streak
          dev.current_streak += 1;
          dev.last_commit_date = new Date();

          // Check if they broke their personal record
          if (dev.current_streak > dev.longest_streak) {
            dev.longest_streak = dev.current_streak;
          }
          
          this.logger.log(`Dev @${dev.github_username} active streak updated to ${dev.current_streak} days.`);
        } else {
          // 🛑 No commits found today. The streak breaks back down to zero
          this.logger.warn(`Dev @${dev.github_username} failed to commit code today. Streak reset.`);
          dev.current_streak = 0;
        }

        // Save modifications safely back to Postgres
        await this.userRepo.save(dev);

      } catch (error: any) {
        this.logger.error(
          `Failed to process GitHub analytics syncing for @${dev.github_username}: ${error.message}`,
        );
      }
    }

    this.logger.log('Global daily streak verification loop completed successfully.');
  }
}
