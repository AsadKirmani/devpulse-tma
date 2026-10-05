import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);
  private bot: Bot;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    // Initialize the bot using the token provided by @BotFather
    this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');
  }

  onModuleInit() {
    this.registerCommands();
    // Start listening for messages asynchronously without blocking the server boot
    this.bot.start().catch((err) => this.logger.error('Bot crashed:', err));
    this.logger.log('GrammY Bot initialization complete and polling events...');
  }

  private registerCommands() {
    // Insert this inside the registerCommands() method of your TelegramBotService
this.bot.on('pre_checkout_query', async (ctx) => {
  // Always approve pre-checkout updates within 10 seconds to confirm stock availability
  await ctx.answerPreCheckoutQuery(true).catch((err) => {
    this.logger.error(`Pre-checkout resolution failure context: ${err.message}`);
  });
});

this.bot.on('message:successful_payment', async (ctx) => {
  try {
    const paymentInfo = ctx.message.successful_payment;
    const payload = JSON.parse(paymentInfo.invoice_payload);
    
    // Extract metadata injected during Step A
    const targetUserId = payload.userId;
    const assignedPlan = payload.plan;

    // 🏆 Grant Pro features inside Postgres
    await this.userRepo.update(
      { telegram_id: targetUserId },
      { /* Update an 'is_premium' column or change tier properties dynamically here */ }
    );

    this.logger.log(`Success! User ${targetUserId} has upgraded to ${assignedPlan} via ledger invoice ID: ${paymentInfo.telegram_payment_charge_id}`);
    
    // Send a confirmation text message directly to their DM thread
    await ctx.reply('🚀 **Payment Confirmed!** Your global account profile status has successfully been upgraded to **DevPulse Pro**.');
  } catch (error: any) {
    this.logger.error(`Critical: Database update crashed following a successful payment process: ${error.message}`);
  }
});

    // Handle the public /leaderboard group chat command
    this.bot.command('leaderboard', async (ctx) => {
      try {
        // Query top 5 developers sorted by active commit streak
        const topDevs = await this.userRepo.find({
          order: { current_streak: 'DESC' },
          take: 5,
        });

        if (topDevs.length === 0) {
          return await ctx.reply('🛑 No developers have linked their GitHub profiles yet!');
        }

        let responseMessage = '📊 *DevPulse - Top Active Streaks*\n';
        responseMessage += '=========================\n\n';

        topDevs.forEach((dev, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⚡';
          const username = dev.username ? `@${dev.username}` : `User_${dev.telegram_id}`;
          responseMessage += `${medal} *#${index + 1}* ${username} \n   └─ Streak: \`\${dev.current_streak} days\` | Max: \`\${dev.longest_streak}\`\n\n`;
        });

        responseMessage += '🔗 _Open the DevPulse Mini App to sync your commits!_';

        await ctx.reply(responseMessage, { parse_mode: 'Markdown' });
      } catch (error: any) {
        this.logger.error(`Error handling /leaderboard command: ${error.message}`);
        await ctx.reply('⚠️ Failed to compile group data. Please try again.');
      }
    });

    // Provide a helper command for onboarding
    this.bot.command('start', async (ctx) => {
      await ctx.reply('🚀 Welcome to **DevPulse**! Monitor incoming webhooks and track your GitHub streaks directly inside Telegram.', {
        reply_markup: {
          inline_keyboard: [[
            { text: '🎛️ Launch DevPulse Dashboard', web_app: { url: process.env.FRONTEND_URL || '' } }
          ]]
        }
      });
    });
  }
}
