import {
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Min,
    MinLength,
} from 'class-validator';
import { IPayment } from '../interface/payment.interface';

enum PaymentStatus {
    'accepted',
    'waiting',
    'fulfilled',
    'rejected',
}

export class CreatePaymentDto implements IPayment {
    @IsDefined()
    @IsNotEmpty({ message: 'Karta raqamini kiriting!' })
    @IsString()
    @MinLength(16, { message: "Eng kamida 16 ta belgi bo'lishi kerak" })
    card: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber({}, { message: 'Tip number tipida bolishi shart!' })
    @Min(50000, { message: "Eng kam to'lov 50000 dan kam bo'lmasligi kerak" })
    amount: number;
}

export class UpdatePaymentDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsEnum(PaymentStatus)
    status?: string;

    @IsString()
    message?: string;
}
