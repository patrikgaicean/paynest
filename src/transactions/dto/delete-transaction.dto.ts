import { ApiProperty } from "@nestjs/swagger";
import { Max, Min } from "class-validator";

export class DeleteTransactionDto {
  @ApiProperty({
    description: "Amount included in transaction - for confirmation.",
    example: 200,
  })
  @Min(1)
  @Max(100000)
  amount: number;
}
