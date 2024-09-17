import {
    IsDefined,
    IsNotEmpty,
    IsNumberString,
    IsString,
} from 'class-validator';
import { IId, INumber } from '../interface/params.interface';

export class ValidateParamsDTO implements IId {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    id: string;
}

export class ValidateParamsNumberDTO implements INumber {
    @IsNumberString({}, { message: 'Xato tip kiritildi, raqam kiriting!' })
    number: number;
}
