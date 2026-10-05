import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayloadLog } from './entities/payload-log.entity';
import { WebhookEndpoint } from './entities/endpoint.entity';
import { WebhookGateway } from '../gateway/webhook.gateway'; // Your WebSocket server
import { GitHubParserService } from './github-parser.service';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(PayloadLog) private logRepo: Repository<PayloadLog>,
    @InjectRepository(WebhookEndpoint) private endpointRepo: Repository<WebhookEndpoint>,
    private readonly wsGateway: WebhookGateway,
    private readonly githubParser: GitHubParserService,
  ) {}

  async processPayload(endpointId: string, method: string, headers: any, body: any) {
    // 1. Verify endpoint exists
    const endpoint = await this.endpointRepo.findOne({ where: { id: endpointId } });
    if (!endpoint) throw new NotFoundException('Webhook endpoint invalid.');

    // 2. Persist to Postgres
    const log = this.logRepo.create({
      endpoint_id: endpointId,
      http_method: method,
      headers,
      body,
    });
    const savedLog = await this.logRepo.save(log);

    // 3. Fire real-time WebSocket event to the user's open Mini App screen
    this.wsGateway.server.to(endpoint.user_id.toString()).emit('new-payload', savedLog);
    // Inside your processPayload method in webhook.service.ts:
const githubEventSummary = this.githubParser.parsePushEvent(headers, body);

if (githubEventSummary) {
  // If it's a valid push event, broadcast the clean summary data instead of raw bloated JSON
  this.wsGateway.server.to(endpoint.user_id.toString()).emit('new-payload', {
    http_method: method,
    received_at: new Date(),
    body: githubEventSummary // Clean, beautiful code metrics
  });
} else {
  // Fallback to storing raw json body for custom non-GitHub webhooks
  this.wsGateway.server.to(endpoint.user_id.toString()).emit('new-payload', savedLog);
}


    return { success: true };
  }

}
