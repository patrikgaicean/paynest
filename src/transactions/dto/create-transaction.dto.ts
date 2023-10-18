import { IsEnum, IsNotEmpty, IsNumber, Min, ValidateIf } from "class-validator";
import { TransactionType } from "./interfaces";
import { ApiProperty } from "@nestjs/swagger";
import { MaxAmount } from "../../validators/maxAmount.validator";

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    description: "Transaction type. Must be 'topup' or 'transfer'.",
  })
  @IsEnum(TransactionType, {
    message: "Invalid transaction type. Must be 'topup' or 'transfer'.",
  })
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    description: "Account id of the receiver in case of transfer transaction type.",
    example: 123,
  })
  @ValidateIf((t: CreateTransactionDto) => t.type === TransactionType.transfer )
  @IsNumber()
  @Min(1)
  receiverId: number;

  @ApiProperty({
    description: "Account id of sender.",
    example: 12,
  })
  senderId: number; // TODO: get it out of JWT. included for now for testing

  @ApiProperty({
    description: "Amount to be transfered (up to $100000 per day or $5000 for top-up)",
    example: 200,
  })
  @Min(1)
  @MaxAmount() // 5000 for top-ups, 100_000 for transfers
  amount: number;
}
