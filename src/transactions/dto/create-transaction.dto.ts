import { IsEnum, IsNotEmpty, IsNumber, Min, ValidateIf, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { TransactionType } from "./interfaces";

@ValidatorConstraint({ name: "maxAmount", async: false })
export class MaxAmountValidator implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const { object } = args;

    if ((object as CreateTransactionDto).type === TransactionType.transfer) {
      return value <= 5000;
    } else {
      return value <= 100_000;
    }
  }
}

export function MaxAmount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MaxAmountValidator,
    });
  };
}

export class CreateTransactionDto {
  @IsEnum(TransactionType, {
    message: "Invalid transaction type. Must be 'topup' or 'transfer'.",
  })
  @IsNotEmpty()
  type: TransactionType;

  @ValidateIf((t: CreateTransactionDto) => t.type === TransactionType.transfer )
  @IsNumber()
  @Min(1)
  accountId?: number;

  @Min(1)
  @MaxAmount() // 5000 for top-ups, 100_000 for transfers
  amount: number;
}
