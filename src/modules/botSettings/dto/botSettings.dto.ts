import { IsBoolean, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { EditBotSettings } from '../interface/botSettings.inreface';

export class UpdateBotSettingsDto implements EditBotSettings {
    @IsBoolean()
    ready?: boolean;

    @IsBoolean()
    onway?: boolean;

    @IsBoolean()
    delivered?: boolean;

    @IsBoolean()
    canceled?: boolean;

    @IsBoolean()
    pending?: boolean;

    @IsBoolean()
    hold?: boolean;

    @IsBoolean()
    archived?: boolean;

    @IsBoolean()
    payment?: boolean;

    @IsBoolean()
    new_order?: boolean;

    @IsBoolean()
    new_product?: boolean;

    @IsBoolean()
    update_product?: boolean;
}

export class SendMessage {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    message: string;
}
