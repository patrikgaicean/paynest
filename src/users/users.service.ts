import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import PostgresErrorCodes from '../database/postgresErrorCodes.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email: email } });
  }

  async createUser(signUpDto: SignUpDto) {
    const user = this.usersRepository.create(signUpDto)
    try {
      const {
        password,
        ...details
      } = await this.usersRepository.save(user);

      return details;
    } catch (err) {
      if (err?.code === PostgresErrorCodes.UniqueViolation) {
        throw new HttpException('Already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
