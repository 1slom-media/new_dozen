import { IExpo } from '../interface/expo.interface';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export default class CreateExpoToken implements IExpo {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsString()
    userId?: string;
}
