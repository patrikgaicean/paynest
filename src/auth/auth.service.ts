import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

    const payload = { sub: user.user_id, email: user.email }
    return {
      acess_token: await this.jwtService.signAsync(payload)
    }
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
