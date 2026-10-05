import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { WebhookEndpoint } from '../../webhook/entities/endpoint.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  telegram_id!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  github_username!: string | null;

  @Column({ type: 'text', nullable: true })
  github_access_token!: string | null;

  @Column({ type: 'int', default: 0 })
  current_streak!: number;

  @Column({ type: 'int', default: 0 })
  longest_streak!: number;

  @Column({ type: 'date', nullable: true })
  last_commit_date!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToMany(() => WebhookEndpoint, (endpoint) => endpoint.user)
  endpoints!: WebhookEndpoint[];
}
