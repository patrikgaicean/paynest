import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TransactionStatus, TransactionType } from "../dto/interfaces";
import Decimal from "decimal.js";
import { Transform } from "class-transformer";
import { DecimalToString, DecimalTransformer } from "../../transformers/decimal.transformer";

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  transaction_id: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ nullable: true })
  consent: boolean | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0, transformer: new DecimalTransformer() })
  @Transform(({ value }) => DecimalToString(2)(value), { toPlainOnly: true })
  amount: Decimal;

  @CreateDateColumn()
  created_at: Date;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'receiver_id' })
  receiverId: number;
}
