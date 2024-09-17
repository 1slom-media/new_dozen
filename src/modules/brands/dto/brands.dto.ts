import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IBrand } from '../interface/brands.interface';

export class BrandsDto implements IBrand {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    title: string;
}
