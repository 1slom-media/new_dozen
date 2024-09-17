import {
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsString,
} from 'class-validator';
import { IBanner } from '../interface/banner.interface';

export class CreateBanner implements IBanner {
    @IsDefined()
    @IsNotEmpty()
    @IsNumberString()
    productId: number;

    @IsString()
    image: string;

    @IsBoolean()
    active?: boolean;
}

export class UpdateBanner {
    @IsDefined()
    @IsNotEmpty()
    @IsBoolean()
    active?: boolean;
}
