import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { TransactionType } from "../transactions/dto/interfaces";

@ValidatorConstraint({ name: "maxAmount", async: false })
export class MaxAmountValidator implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const { object } = args;

    if ((object as { type: TransactionType}).type === TransactionType.topup) {
      if (value > 5000) {
        return false;
      }
    } else {
      if (value > 100000) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Transfer amount exceeds permitted limit.';
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
