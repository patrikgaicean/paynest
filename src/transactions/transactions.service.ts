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
import Decimal from 'decimal.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getAll(): Promise<Transaction[]> { // allow logged in user to see all HIS transactions
    return this.transactionsRepository.find(); // get from JWT
    // return this.transactionsRepository.find({ where: { senderId: 123 }}); // get from JWT
  }

  async getOne(id: number): Promise<Transaction> { // same as above
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id  }});
    // const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id, senderId: 123 }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const sender = await this.usersRepository.findOne({ where: { user_id: createTransactionDto.senderId }}); // get from JWT

    if (!sender) {
      throw new NotFoundException(`Invalid sender id ${createTransactionDto.senderId}.`);
    }

    let newTransaction: Transaction;
  
    switch (createTransactionDto.type) {
      case TransactionType.topup: {
        newTransaction = this.transactionsRepository.create({
          ...createTransactionDto,
          senderId: createTransactionDto.senderId,
          receiverId: createTransactionDto.senderId,
          consent: true,
          status: TransactionStatus.succeeded,
        });

        sender.balance = new Decimal(sender.balance).plus(createTransactionDto.amount);
        break;
      }

      case TransactionType.transfer: {
        const receiver = await this.usersRepository.findOne({ where: { user_id: createTransactionDto.receiverId }});

        if (!receiver) {
          throw new NotFoundException(`Invalid receiver id ${createTransactionDto.receiverId}.`);
        }

        newTransaction = this.transactionsRepository.create({
          ...createTransactionDto,
          senderId: createTransactionDto.senderId,
          consent: null,
          status: TransactionStatus.pending,
        });
  
        if (new Decimal(createTransactionDto.amount).gt(sender.balance)) {
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

  async delete(id: number, deleteTransactionDto: DeleteTransactionDto): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({ where: { transaction_id: id }});

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found.`);
    }

    if (transaction.status !== TransactionStatus.pending) {
      throw new BadRequestException(`Transaction fulfilled - can no longer be deleted.`);
    }

    if (!new Decimal(deleteTransactionDto.amount).eq(transaction.amount)) {
      throw new BadRequestException(`Transaction amount does not match for confirmation.`);
    }

    const sender = await this.usersRepository.findOne({ where: { user_id: transaction.senderId }}); // get it from jwtttt
  
    sender.balance = new Decimal(sender.balance).plus(transaction.amount);
  
    await this.usersRepository.save(sender);
    await this.transactionsRepository.remove(transaction);
  }
}
