import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(signUpDto: SignUpDto) {
    await this.usersService.createUser(signUpDto)
    return 'sign up hit';
  }

  async signIn(signInDto: SignUpDto) {
    return 'sign in hit';
  }
}
