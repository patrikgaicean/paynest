import { IsEmail, IsStrongPassword } from "class-validator";

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minNumbers: 3,
    minLowercase: 3,
    minUppercase: 2,
    minSymbols: 1,
  })
  password: string;
}
