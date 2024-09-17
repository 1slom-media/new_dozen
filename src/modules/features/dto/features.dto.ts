import {
    IsDefined,
    IsNotEmpty,
    IsString,
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
} from 'class-validator';
import { IFeatures } from '../interface/features.interface';

function TitleValidator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'titleValidator',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    try {
                        if (typeof value !== 'object' || value === null) {
                            throw new Error('Xususiyat xato kiritilgan');
                        }

                        const title: { uz: string; ru: string; en: string } =
                            value;

                        if (!title.uz || typeof title.uz !== 'string')
                            throw new Error(
                                'Xususiyat titleida uz qiymati unutilgan yoki tipi string emas'
                            );
                        if (!title.ru || typeof title.ru !== 'string')
                            throw new Error(
                                'Xususiyat titleida ru qiymati unutilgan yoki tipi string emas'
                            );
                        if (!title.en || typeof title.en !== 'string')
                            throw new Error(
                                'Xususiyat titleida en qiymati unutilgan yoki tipi string emas'
                            );
                    } catch (err) {
                        throw err;
                    }
                    return true;
                },
                defaultMessage(validationArguments?: ValidationArguments) {
                    return (
                        validationArguments && validationArguments[0]?.message
                    );
                },
            },
        });
    };
}
export class CreateFeatureDto implements IFeatures {
    @IsDefined()
    @IsNotEmpty()
    @TitleValidator()
    title: any;
}
