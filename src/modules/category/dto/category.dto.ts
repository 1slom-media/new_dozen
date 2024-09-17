import { ICreateCategory } from './../interface/category.interface';
import {
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
    IsBooleanString,
} from 'class-validator';

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
                        if (
                            typeof JSON.parse(value) !== 'object' ||
                            JSON.parse(value) === null
                        ) {
                            throw new Error('Kategoriya xato kiritilgan');
                        }

                        const title: { uz: string; ru: string; en: string } =
                            JSON.parse(value);

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

export class CreateCategoryDto implements ICreateCategory {
    @IsDefined()
    @IsNotEmpty()
    @TitleValidator()
    title: any;

    @IsString()
    avatar?: string;

    @IsOptional()
    @IsBooleanString()
    adult?: any;
}

export class UpdateCategoryDto implements ICreateCategory {
    @IsOptional()
    @TitleValidator()
    title: any;

    @IsString()
    @IsNotEmpty()
    avatar?: string;

    @IsOptional()
    @IsBoolean()
    adult?: any;
}
