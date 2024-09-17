import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ISms } from '../interface/sms.interface';

export class UpdateSmsServiceDto implements ISms {
    @IsNotEmpty()
    @IsBoolean()
    archived?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    canceled?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    delivered?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    hold?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    onway?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    pending?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    ready?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    rejected?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    fulfilled?: boolean;

    @IsNotEmpty()
    @IsBoolean()
    new_payment?: boolean;
}
