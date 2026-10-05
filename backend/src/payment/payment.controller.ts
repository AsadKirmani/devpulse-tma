import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Controller('v1/payments')
export class PaymentController {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;

  @Post('create-invoice')
  async createStarsInvoice(@Body() body: { telegramId: number; planType: string }) {
    const { telegramId, planType } = body;
    
    // Configure pricing configurations based on your app's pricing plan
    const amount = planType === 'pro_monthly' ? 50 : 250;

    try {
      // Hit Telegram's native createInvoice Link mechanism
      const response = await axios.post(`https://telegram.org/bot${this.botToken}/createInvoiceLink`, {
        title: 'DevPulse Pro Upgrade',
        description: 'Unlocks historical webhook storage logs and custom group metric tracking alerts.',
        payload: JSON.stringify({ userId: telegramId, plan: planType }),
        provider_token: '', // Mandatory empty string for Telegram Stars digital product routing
        currency: 'XTR',    // 'XTR' is the native currency code for Telegram Stars
        prices: [{ label: 'Pro Tier Membership', amount: amount }],
      });

      if (!response.data.ok) {
        throw new Error(response.data.description);
      }

      // Return the invoice link to your open Next.js client layout
      return { success: true, invoiceLink: response.data.result };
    } catch (error: any) {
      throw new HttpException(`Payment Initiation Failed: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
