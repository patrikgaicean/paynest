import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({
    description: "Email address you registered with.",
    example: "someone@gmail.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Password associated to your accont.",
    example: "this1$AdecentPA55",
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
