import { Controller, Post, Body, HttpCode, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('v1/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @Post('sync-github')
  @HttpCode(HttpStatus.OK)
  async syncGitHubProfile(
    @Body() body: { telegramId: number; githubUsername: string; accessToken: string; username?: string }
  ) {
    const { telegramId, githubUsername, accessToken, username } = body;

    // 1. Look up if user record entry exists, otherwise instantiate a new entity
    let user = await this.userRepo.findOne({ where: { telegram_id: telegramId } });

    if (!user) {
      user = this.userRepo.create({
        telegram_id: telegramId,
        username: username || null,
      });
    }

    // 2. Attach updated developer ecosystem properties
    user.github_username = githubUsername;
    user.github_access_token = accessToken;

    await this.userRepo.save(user);
    this.logger.log(`Successfully synced profile mapping details for Telegram User: ${telegramId} -> GitHub: @${githubUsername}`);

    return { success: true, message: 'Developer telemetry access mappings synced successfully.' };
  }
}
