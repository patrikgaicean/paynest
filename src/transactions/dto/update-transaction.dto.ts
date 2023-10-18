import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateTransactionDto {
  @ApiProperty({
    description: "Consent decision. Must be 'true' or 'false'.",
  })
  @IsBoolean()
  consent: boolean;
}
