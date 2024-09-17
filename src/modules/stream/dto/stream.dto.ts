import { IStream } from '../interface/stream.interface';
import {
    IsBoolean,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsNumberString,
    IsString,
} from 'class-validator';

export class CreateStreamDto implements IStream {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    product: number;
}

export class UpdateStreamDto {
    @IsString()
    name?: string;

    @IsNumberString()
    number?: number;

    @IsString()
    user?: string;

    @IsNumber()
    product?: number;

    @IsNumber()
    visits_count?: number;

    @IsBoolean()
    isDeleted?: boolean;
}

export class UpdateStreamForUser {
    @IsDefined()
    @IsNotEmpty()
    @IsBoolean()
    isRegionOn: boolean;
}
