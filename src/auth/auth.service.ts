import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async signIn(user: any) {
    const payload = { sub: user.user_id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload)
    }
  }

  async validateUser(email: string, password: string) {
    const {
      password: hashedPassword,
      ...user
    } = await this.usersService.findOne(email);

    await this.verifyPassword(password, hashedPassword);

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
