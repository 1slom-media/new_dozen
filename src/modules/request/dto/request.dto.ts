import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { IRequest } from '../interface/request.interface';

export class CreateRequestDto implements IRequest {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    order: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    msg: string;
}
