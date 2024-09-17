import {
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { IBlacklist } from '../interface/blacklist.interface';

export class CreateBlackListDto implements IBlacklist {
    @IsDefined()
    @IsNotEmpty()
    @IsPhoneNumber('UZ')
    phone: string;

    @IsString()
    name?: string;
}

export class UpdateBlackListDto {
    @IsDefined()
    @IsNotEmpty()
    @IsBoolean()
    isBlock: boolean;
}
