import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { TransactionType } from "src/transactions/dto/interfaces";

@ValidatorConstraint({ name: "maxAmount", async: false })
export class MaxAmountValidator implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const { object } = args;

    if ((object as { type: TransactionType}).type === TransactionType.transfer) {
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
