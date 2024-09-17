import {
    IsDefined,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';
import { ICard } from '../interface/cards.interface';

export class CreateCardDto implements ICard {
    @IsDefined()
    @IsNotEmpty()
    @IsNumberString()
    @Length(16)
    card: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @Length(5)
    expireDate: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class UpdateCardDto implements ICard {
    @IsOptional()
    @IsNotEmpty()
    @IsNumberString()
    @Length(16)
    card: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Length(5)
    expireDate: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name: string;
}
