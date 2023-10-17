import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

    return await this.usersService.createUser({
      email: signUpDto.email,
      password: hashedPassword,
    });
  }

  async signIn(signInDto: SignUpDto) {
    const {
      password: hashedPassword,
      ...user
    } = await this.usersService.findOne(signInDto.email);

    await this.verifyPassword(signInDto.password, hashedPassword);

    return user;
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }
  }
}
