import {
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
} from 'class-validator';
import { ISubFeature } from '../interface/subfeatures.interface';

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
                            throw new Error('Kategoriya xato kiritilgan');
                        }

                        const title: { uz: string; ru: string; en: string } =
                            value;

                        if (!title.uz || typeof title.uz !== 'string')
                            throw new Error(
                                'Kategoriya titleida uz qiymati unutilgan yoki tipi string emas'
                            );
                        if (!title.ru || typeof title.ru !== 'string')
                            throw new Error(
                                'Kategoriya titleida ru qiymati unutilgan yoki tipi string emas'
                            );
                        if (!title.en || typeof title.en !== 'string')
                            throw new Error(
                                'Kategoriya titleida en qiymati unutilgan yoki tipi string emas'
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

export class CreateSubFeatureDto implements ISubFeature {
    @IsDefined()
    @IsNotEmpty()
    @TitleValidator()
    title: any;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    value: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    sku: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    charId: number;

    @IsOptional()
    @IsBoolean()
    isColor?: boolean;
}

export class UpdateSubFeatureDto {
    @IsOptional()
    @IsNotEmpty()
    @TitleValidator()
    title?: any;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    value?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    sku?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsBoolean()
    isColor?: boolean;
}
