import {
    IsDefined,
    IsNotEmpty,
    IsString,
    IsBooleanString,
    IsNumberString,
    IsNumber,
    IsArray,
    IsOptional,
    IsEmail,
} from 'class-validator';
import { IUser } from '../interface/user.interface';
import { IsPhoneNumber } from '../../shared/dto/phone.dto';
export class CreateUserDto implements IUser {
    @IsString()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;

    @IsNumberString()
    region: number;

    @IsNumber()
    smsCode?: number;
}

export class UpdateUserDto implements IUser {
    @IsString()
    name?: string;

    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone?: string;

    @IsBooleanString()
    isAdmin?: boolean;

    @IsBooleanString()
    isSeller?: boolean;

    @IsBooleanString()
    isOperator?: boolean;

    @IsNumberString()
    balance?: number;

    @IsNumberString()
    deposit?: number;

    @IsNumberString()
    paid?: number;

    @IsNumber()
    status?: number;

    @IsNumberString()
    region?: number;

    @IsNumberString()
    soldProCount?: number;

    @IsNumberString()
    telegramID?: number;

    @IsBooleanString()
    isBotActive?: boolean;

    @IsBooleanString()
    isPhoneActive?: boolean;

    @IsString()
    banner?: string;

    @IsNotEmpty()
    @IsString()
    avatar?: string;

    @IsNumber()
    smsCode?: number;

    @IsNumber()
    countSentCode?: number;

    @IsNumber()
    countSendedSms?: number;

    @IsArray()
    chats?: string[];

    @IsEmail()
    email?: string;

    @IsString()
    surname?: string;

    @IsString()
    nickname?: string;
}

export class UpdateOperatorDto implements IUser {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumberString()
    region?: number;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    surname?: string;

    @IsOptional()
    @IsString()
    nickname?: string;
}

export class UpdateDeposit {
    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    deposit?: number;
}
