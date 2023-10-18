import { Transform } from 'class-transformer';
import Decimal from 'decimal.js';
import { DecimalToString, DecimalTransformer } from '../../transformers/decimal.transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0, transformer: new DecimalTransformer() })
  @Transform(({ value }) => DecimalToString(2)(value), { toPlainOnly: true })
  balance: Decimal;
}
