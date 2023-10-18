import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TransactionType } from "../dto/interfaces";

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  transaction_id: number;

  @Column({ type: 'enum', enum: TransactionType })
  status: TransactionType;

  @Column({ nullable: true })
  consent: boolean | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'receiver_id' })
  receiverId: number;
}
