import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class SignInDto {
  @ApiProperty({
    description: "A valid email address.",
    example: "someone@gmail.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Password - must contain at least 3 digits, 3 lowercase characters, 2 uppercase characters, one symbol.",
    example: "this1$AdecentPA55",
  })
  @IsStrongPassword({
    minNumbers: 3,
    minLowercase: 3,
    minUppercase: 2,
    minSymbols: 1,
  })
  password: string;
}
