import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IInvoices } from '../interface/invoices.interface';

export class CreateInvoiceDto implements IInvoices {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    order_id: any;
}
