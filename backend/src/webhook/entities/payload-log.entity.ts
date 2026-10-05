import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { WebhookEndpoint } from './endpoint.entity';

@Entity('payload_logs')
export class PayloadLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid' })
  @Index('idx_payload_logs_endpoint')
  endpoint_id!: string;

  @Column({ type: 'varchar', length: 10 })
  http_method!: string;

  @Column({ type: 'jsonb' })
  headers: any;

  @Column({ type: 'jsonb' })
  body: any;
    
  @CreateDateColumn({ type: 'timestamp' })
  received_at!: Date;

  @ManyToOne(() => WebhookEndpoint, (endpoint) => endpoint.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'endpoint_id' })
  endpoint!: WebhookEndpoint;
}
