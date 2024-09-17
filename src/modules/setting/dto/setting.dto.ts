import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsOptional,
    IsString,
} from 'class-validator';
import { IStetting } from '../interface/setting.interface';

export class CreateSettingDto implements IStetting {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    sitePhone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    address: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    tgLink: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    instaLink: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    fbLink: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumberString()
    paymentOperator: number;

    @IsNumberString()
    penaltyOperator: number;

    @IsString()
    logo: string;

    @IsNumberString()
    layOut: number;

    @IsString()
    eskiz_token?: string;

    @IsString()
    marketingGroup?: string;

    @IsOptional()
    @IsString()
    supportBot?: string;

    @IsOptional()
    @IsString()
    supportPhone?: string;

    @IsOptional()
    @IsNumber()
    highestPriceForCheapProducts?: number;
}
