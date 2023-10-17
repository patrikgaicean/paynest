import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  signUp(signUpDto: SignUpDto) {
    return 'sign up hit';
  }

  signIn(signInDto: SignUpDto) {
    return 'sign in hit';
  }
}
