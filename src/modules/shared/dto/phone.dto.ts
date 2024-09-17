// phoneNumber.decorator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'phoneNumber', async: false })
export class PhoneNumberConstraint implements ValidatorConstraintInterface {
    validate(phoneNumber: string): boolean {
        if (typeof phoneNumber !== 'string') {
            return false;
        }

        const l = phoneNumber[0];
        const val = phoneNumber.slice(1);

        return (
            Number(val) > 998000000000 &&
            Number(val) <= 998999999999 &&
            l === '+'
        );
    }
}

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: PhoneNumberConstraint,
        });
    };
}
