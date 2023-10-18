import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus, TransactionType } from './dto/interfaces';
import { User } from '../users/entities/user.entity';
import assert from 'assert';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find();
  }

  async getOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const sender = await this.usersRepository.findOne({ where: { user_id: 123 }}); // get from JWT

    let newTransaction: Transaction;
  
    switch (createTransactionDto.type) {
      case TransactionType.topup: {
        newTransaction = this.transactionsRepository.create({
          ...createTransactionDto,
          senderId: 123,
          consent: true,
          status: TransactionStatus.succeeded,
        });
        break;
      }
        
      case TransactionType.transfer: {
        newTransaction = this.transactionsRepository.create({
          ...createTransactionDto,
          senderId: 123,
          consent: null,
          status: TransactionStatus.pending,
        });
  
        if (sender.balance < createTransactionDto.amount) {
          throw new BadRequestException(`Insufficient balance for transfer.`);
        }
  
        sender.balance -= createTransactionDto.amount;
        await this.usersRepository.save(sender);
        break;
      }
        
      default:
        assert(false, `Request validation should not let us get here.`);
    }
  
    return this.transactionsRepository.save(newTransaction);
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    if (transaction.status !== TransactionStatus.pending) {
      throw new BadRequestException(`Transaction fulfilled - can no longer be updated.`);
    }

    switch (updateTransactionDto.consent) {
      case true: { // update receiver's balance
        const receiver = await this.usersRepository.findOne({ where: { user_id: transaction.receiverId }});

        if (!receiver) {
          throw new NotFoundException(`Invalid receiver id ${id}.`);
        }

        receiver.balance += transaction.amount;
        await this.usersRepository.save(receiver);
        break;
      }
        
      case false: { // reimburse sender
        const sender = await this.usersRepository.findOne({ where: { user_id: transaction.senderId }});

        sender.balance += transaction.amount;
        await this.usersRepository.save(sender);
        break;
      }
        
      default:
        assert(false, `Request validation should not let us get here.`);
    }

    transaction.status = updateTransactionDto.consent
      ? TransactionStatus.succeeded
      : TransactionStatus.failed;

    return this.transactionsRepository.save(transaction);
  }

  async delete(id: number, deleteTransactionDto: DeleteTransactionDto): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    if (transaction.status !== TransactionStatus.pending) {
      throw new BadRequestException(`Transaction fulfilled - can no longer be deleted.`);
    }

    if (transaction.amount !== deleteTransactionDto.amount) {
      throw new BadRequestException(`Transaction amount does not match for confirmation.`);
    }

    await this.transactionsRepository.remove(transaction);
  }
}
