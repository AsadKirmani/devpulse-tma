import { Controller, Post, Body, Headers, Param, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Request } from 'express';

@Controller('v1/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post(':endpointId')
  @HttpCode(HttpStatus.OK)
  async handleIncomingWebhook(
    @Param('endpointId') endpointId: string,
    @Headers() headers: any,
    @Body() body: any,
    @Req() req: Request
  ) {
    return await this.webhookService.processPayload(endpointId, req.method, headers, body);
  }
}
