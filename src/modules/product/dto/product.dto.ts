import {
    ArrayNotEmpty,
    IsArray,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidationOptions,
    Validate,
    registerDecorator,
    ValidationArguments,
    IsBoolean,
    ValidateNested,
    MaxLength,
} from 'class-validator';
import {
    IProduct,
    ProductImage,
    ICharacteristcs,
} from '../interface/product.interface';
import { IUpdateSku } from '../interface/sku.interface';

function CharacteristicsValidator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'characteristicsValidator',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    try {
                        const features: ICharacteristcs[] = value;

                        features.forEach((feature, f_index) => {
                            if (!feature.values.length)
                                throw new Error(
                                    `${features}ning ichki xususiyatlari yo'q bo'lishi mumkin emas!`
                                );
                        });
                    } catch (error) {
                        throw error;
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

function DescriptionValidator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'descriptionValidator',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    try {
                        if (typeof value !== 'object' || value === null) {
                            throw new Error('Description xato kiritilgan');
                        }

                        const description: {
                            uz: string;
                            ru: string;
                            en: string;
                        } = value;
                        if (
                            !description.uz ||
                            typeof description.uz !== 'string'
                        )
                            throw new Error(
                                'Mahsulot descriptionida uz qiymati unutilgan yoki tipi string emas'
                            );
                        if (
                            !description.ru ||
                            typeof description.ru !== 'string'
                        )
                            throw new Error(
                                'Mahsulot descriptionida ru qiymati unutilgan yoki tipi string emas'
                            );
                        if (
                            !description.en ||
                            typeof description.en !== 'string'
                        )
                            throw new Error(
                                'Mahsulot descriptionida en qiymati unutilgan yoki tipi string emas'
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

function ProductImageValidator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'productImagesValidator',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    try {
                        const images: ProductImage[] = value;

                        images.forEach((element) => {
                            if (
                                !element.image[80].high ||
                                !element.image[80].low
                            )
                                throw new Error(
                                    '80 format of the image was not entered'
                                );
                            if (
                                !element.image[240].high ||
                                !element.image[240].low
                            )
                                throw new Error(
                                    '240 format of the image was not entered'
                                );
                            if (
                                !element.image[540].high ||
                                !element.image[540].low
                            )
                                throw new Error(
                                    '540 format of the image was not entered'
                                );
                            if (
                                !element.image[720].high ||
                                !element.image[720].low
                            )
                                throw new Error(
                                    '720 format of the image was not entered'
                                );
                            if (
                                !element.image[800].high ||
                                !element.image[800].low
                            )
                                throw new Error(
                                    '800 format of the image was not entered'
                                );
                            if (!element.imageKey)
                                throw new Error('Image key was not entered');
                        });
                    } catch (error) {
                        throw error;
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

function SkuValidator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'skuValidator',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: IUpdateSku[], args: ValidationArguments) {
                    try {
                        if (!value.length)
                            throw new Error(
                                'Tahrirlash uchun avval malumot kiriting'
                            );
                        value.forEach((sku) => {
                            if (
                                (sku.uid !== undefined &&
                                    typeof sku.uid !== 'number') ||
                                (sku.productId !== undefined &&
                                    typeof sku.productId !== 'number') ||
                                (sku.availableAmount !== undefined &&
                                    typeof sku.availableAmount !== 'number') ||
                                (sku.fullPrice !== undefined &&
                                    typeof sku.fullPrice !== 'number') ||
                                (sku.boughtPrice !== undefined &&
                                    typeof sku.boughtPrice !== 'number') ||
                                (sku.referalPrice !== undefined &&
                                    typeof sku.referalPrice !== 'number') ||
                                (sku.discountPrice !== undefined &&
                                    typeof sku.discountPrice !== 'number') ||
                                (sku.blocked !== undefined &&
                                    typeof sku.blocked !== 'boolean') ||
                                (sku.allowMarket !== undefined &&
                                    typeof sku.allowMarket !== 'boolean')
                            ) {
                                throw new Error(
                                    'Sku obyektini ichidagi elementlarning tipi kutilgandagidek emas'
                                );
                            }
                            if (!sku.uid || !sku.productId)
                                throw new Error(
                                    'Har bir variantning uidsi yoki mahsulot idsi kiritilmagan'
                                );
                            if (sku.discountPrice >= sku.fullPrice)
                                throw new Error(
                                    'Chegirma narxi mahsulot narxiga teng yoki katta bolmasligi kerak'
                                );
                            if (sku.referalPrice >= sku.fullPrice)
                                throw new Error(
                                    'Referal narx mahsulot narxiga teng yoki katta bolmasligi kerak'
                                );
                        });
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

export class CreateProductDto implements IProduct {
    @IsDefined()
    @IsNotEmpty()
    @TitleValidator()
    title: any;

    @IsDefined()
    @IsString()
    @IsOptional()
    seller?: string;

    @IsDefined()
    @IsString()
    @IsOptional()
    admin?: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    category: number;

    @IsDefined()
    @IsNotEmpty()
    @DescriptionValidator()
    description: any;

    @IsOptional()
    @IsBoolean()
    allowMarket?: boolean;

    @IsDefined()
    @IsArray()
    @ArrayNotEmpty({ message: 'Maxsulot rasmini kiriting' })
    @ProductImageValidator()
    images?: ProductImage[];

    @IsOptional()
    @IsBoolean()
    adult?: boolean;

    @IsOptional()
    @CharacteristicsValidator()
    characteristics?: ICharacteristcs[];

    @IsOptional()
    positions?: string[];

    @IsOptional()
    @DescriptionValidator()
    sizesDescription?: { uz: string; ru: string; en: string };

    @IsOptional()
    @DescriptionValidator()
    featureDescription?: { uz: string; ru: string; en: string };

    @IsOptional()
    @IsNumber()
    brand?: number;
}

export class UpdateProductDto implements IProduct {
    @IsOptional()
    @IsNotEmpty()
    @TitleValidator()
    title: any;

    @IsOptional()
    @IsNotEmpty()
    @DescriptionValidator()
    description: any;

    @IsOptional()
    positions?: string[];

    @IsOptional()
    @IsBoolean()
    allowMarket?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty({ message: 'Maxsulot rasmini kiriting' })
    @ProductImageValidator()
    images?: ProductImage[];

    @IsOptional()
    @IsBoolean()
    adult?: boolean;

    @IsOptional()
    @CharacteristicsValidator()
    characteristics?: ICharacteristcs[];

    @IsOptional()
    @DescriptionValidator()
    sizesDescription?: { uz: string; ru: string; en: string };

    @IsOptional()
    @DescriptionValidator()
    featureDescription?: { uz: string; ru: string; en: string };

    @IsOptional()
    @IsBoolean()
    blocked?: boolean;

    @IsOptional()
    @IsString()
    blockingReason?: string;

    @IsOptional()
    @IsNumber()
    brand?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    discountBadges?: number[];

    @IsOptional()
    @IsString()
    madeIn?: string;

    @IsOptional()
    @IsString()
    video?: string;
}

class ObjectValidator implements IUpdateSku {
    @IsDefined()
    @IsNumber()
    uid: number;

    @IsOptional()
    @IsNumber()
    availableAmount?: number;

    @IsOptional()
    @IsNumber()
    boughtPrice?: number;

    @IsOptional()
    @IsNumber()
    discountPrice?: number;

    @IsOptional()
    @IsNumber()
    fullPrice?: number;

    @IsOptional()
    @IsBoolean()
    allowMarket?: boolean;

    @IsOptional()
    @IsBoolean()
    blocked?: boolean;

    @IsOptional()
    @IsNumber()
    referalPrice?: number;
}

export class UpdateSkuDto {
    @IsDefined()
    @IsArray()
    @SkuValidator()
    @ValidateNested({ each: true })
    skuList: ObjectValidator[];

    @IsDefined()
    @IsString()
    @MaxLength(7)
    productSku?: string;
}
