import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, MoreThan, Not, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus, TransactionType } from './dto/interfaces';
import { User } from '../users/entities/user.entity';
import assert from 'assert';
import Decimal from 'decimal.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAll(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: [
        { senderId: userId },
        { receiverId: userId },
      ]
    });
  }

  async getOne(id: number, userId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.transaction_id = :transactionId', { transactionId: id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('transaction.sender_id = :userId', { userId: userId })
            .orWhere('transaction.receiver_id = :userId', { userId: userId });
        })
      )
      .getOne();

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto, senderId: number): Promise<Transaction> {
    const sender = await this.usersRepository.findOne({ where: { user_id: senderId }});

    if (!sender) {
      throw new NotFoundException(`Invalid sender id ${senderId}.`);
    }

    let newTransaction: Transaction;
  
    switch (createTransactionDto.type) {
      case TransactionType.topup: {
        newTransaction = this.transactionsRepository.create({
          ...createTransactionDto,
          senderId: senderId,
          receiverId: senderId,
          consent: true,
          status: TransactionStatus.succeeded,
        });

        sender.balance = new Decimal(sender.balance).plus(createTransactionDto.amount);
        break;
      }

      case TransactionType.transfer: {
        const pendingTransactions = await this.transactionsRepository.findOne({
          where: {
            senderId: senderId,
            status: TransactionStatus.pending,
          },
        });
  
        if (pendingTransactions !== null) {
          throw new BadRequestException(`Cannot initialize a new transaction. Sender with id ${senderId} has a transaction 'pending'.`);
        }
  
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
        const recentTransfers = await this.transactionsRepository.find({
          where: {
            type: TransactionType.transfer,
            status: TransactionStatus.succeeded,
            senderId: senderId,
            created_at: MoreThan(twentyFourHoursAgo),
            receiverId: Not(senderId),
          },
        });
  
        const transfersLast24Hours = recentTransfers.reduce((total, transaction) => {
          return total.plus(transaction.amount);
        }, new Decimal(createTransactionDto.amount));
  
        if (recentTransfers.length >= 5 || transfersLast24Hours.greaterThan(100000)) {
          throw new BadRequestException(`Transaction limits exceeded.`);
        }
  
        const receiver = await this.usersRepository.findOne({ where: { user_id: createTransactionDto.receiverId }});
  
        if (!receiver) {
          throw new NotFoundException(`Invalid receiver id ${createTransactionDto.receiverId}.`);
        }
  
        newTransaction = this.transactionsRepository.create({
          ...createTransactionDto,
          senderId: senderId,
          consent: null,
          status: TransactionStatus.pending,
        });
  
        if (new Decimal(createTransactionDto.amount).greaterThan(sender.balance)) {
          throw new BadRequestException(`Insufficient balance for transfer.`);
        }
  
        sender.balance = new Decimal(sender.balance).minus(createTransactionDto.amount);
        break;
      }
        
      default:
        assert(false, `Request validation should not let us get here.`);
    }

    await this.usersRepository.save(sender);
    return this.transactionsRepository.save(newTransaction);
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto, receiverId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id, receiverId: receiverId }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    if (transaction.status !== TransactionStatus.pending) {
      throw new BadRequestException(`Transaction fulfilled - can no longer be updated.`);
    }

    switch (updateTransactionDto.consent) {
      case true: { // update receiver's balance
        const receiver = await this.usersRepository.findOne({ where: { user_id: receiverId }});

        receiver.balance = new Decimal(receiver.balance).plus(transaction.amount);
        await this.usersRepository.save(receiver);
        break;
      }
        
      case false: { // reimburse sender
        const sender = await this.usersRepository.findOne({ where: { user_id: transaction.senderId }});

        sender.balance = new Decimal(sender.balance).plus(transaction.amount);
        await this.usersRepository.save(sender);
        break;
      }
        
      default:
        assert(false, `Request validation should not let us get here.`);
    }
    
    transaction.consent = updateTransactionDto.consent;
    transaction.status = updateTransactionDto.consent
      ? TransactionStatus.succeeded
      : TransactionStatus.failed;

    return this.transactionsRepository.save(transaction);
  }

  async delete(id: number, deleteTransactionDto: DeleteTransactionDto, senderId: number): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id, senderId: senderId }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    if (transaction.status !== TransactionStatus.pending) {
      throw new BadRequestException(`Transaction fulfilled - can no longer be deleted.`);
    }

    if (!new Decimal(deleteTransactionDto.amount).eq(transaction.amount)) {
      throw new BadRequestException(`Transaction amount does not match for confirmation.`);
    }

    const sender = await this.usersRepository.findOne({ where: { user_id: senderId }});
  
    sender.balance = new Decimal(sender.balance).plus(transaction.amount);
  
    await this.usersRepository.save(sender);
    await this.transactionsRepository.remove(transaction);
  }
}
