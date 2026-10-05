import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Refine to your production Next.js domain URL in staging/prod
  },
})
export class WebhookGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebhookGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client handshaking connection: Connected ID -> ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client session termination: Disconnected ID -> ${client.id}`);
  }

  // Frontend calls this immediately upon loading using the Telegram WebApp InitData ID
  @SubscribeMessage('join-room')
  handleRoomJoin(
    @MessageBody() telegramId: number,
    @ConnectedSocket() client: Socket,
  ) {
    if (!telegramId) {
      client.disconnect();
      return;
    }
    
    const roomId = telegramId.toString();
    client.join(roomId);
    this.logger.log(`WebSocket Client ${client.id} successfully attached to Room: ${roomId}`);
    
    return { status: 'joined', room: roomId };
  }
}
