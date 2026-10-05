import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/entities/user.entity';
import { WebhookEndpoint } from './webhook/entities/endpoint.entity';
import { PayloadLog } from './webhook/entities/payload-log.entity';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { GitHubParserService } from './webhook/github-parser.service';
import { WebhookGateway } from './gateway/webhook.gateway';
import { StreakCronService } from './users/streak.cron.service';
import { TelegramBotService } from './users/bot.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'devpulse_user',
      password: process.env.DATABASE_PASSWORD || 'devpulse_secure_password',
      database: process.env.DATABASE_NAME || 'devpulse_db',
      entities: [User, WebhookEndpoint, PayloadLog],
      synchronize: true, // Turn off in production; use migrations instead
    }),
    TypeOrmModule.forFeature([User, WebhookEndpoint, PayloadLog]),
  ],
  controllers: [WebhookController, UsersController],
  providers: [
    WebhookService,
    GitHubParserService,
    WebhookGateway,
    StreakCronService,
    TelegramBotService,
  ],
})
export class AppModule {}
