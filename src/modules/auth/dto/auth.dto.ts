import { IsPhoneNumber } from '../../shared/dto/phone.dto';
import { ISignIn, ISignUp } from '../interface/auth.interface';
import {
    IsDefined,
    IsNotEmpty,
    IsString,
    MinLength,
    IsNumber,
    Validate,
} from 'class-validator';

export class SignUpDto implements ISignUp {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;
}

export class SignInDto implements ISignIn {
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;
}

export class AuthDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;
}

export class ResetPhoneDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    oldPhone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;
}

export class UpdatePhoneDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    oldPhone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    code: number;
}

export class CheckCodeDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    code: number;
}
