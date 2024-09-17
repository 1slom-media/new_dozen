import { IsPhoneNumber } from '../../shared/dto/phone.dto';
import { IOrder, IOrderItem } from '../interface/order.interface';
import {
    IsDefined,
    IsNotEmpty,
    IsString,
    IsArray,
    IsNumberString,
    IsBooleanString,
    IsNumber,
    ArrayNotEmpty,
    IsEnum,
    IsBoolean,
    Validate,
} from 'class-validator';

enum OrderStatus {
    'ready',
    'canceled',
    'hold',
    'archived',
    'pending',
}

enum OrderStatusOperator {
    'hold',
    'canceled',
    'pending',
}

enum OrderStatusAdmin {
    'new',
    'ready',
    'onway',
    'delivered',
    'canceled',
    'hold',
    'archived',
    'pending',
}
export class CreateOrderDto implements IOrder {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    city_id: number;

    @IsDefined()
    @IsArray()
    @ArrayNotEmpty()
    orderItems: [];

    @IsString()
    status: string;

    @IsString()
    address: string;

    @IsString()
    extra_info: string;

    @IsString()
    userId: string;

    @IsString()
    streamId: string;

    @IsNumberString()
    referal_price: number;

    @IsString()
    prev_status: string;

    @IsBooleanString()
    isTaken: boolean;

    @IsString()
    takenById: string;
}

export class AddProductToOrderDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    variantId: number;
}

export class CreateOrderV1Dto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    // @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    stream: number;
}

export class UpdateOrderDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    price: number;
}

export class UpdateOrderOperatorDto implements IOrder {
    @IsString()
    @IsEnum(OrderStatus)
    status?: string;

    @IsNumber()
    city_id?: number;

    @IsString()
    message?: string;

    @IsString()
    extra_info?: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    address?: string;

    @IsArray()
    @ArrayNotEmpty()
    orderItems: [];
}

export class UpdateOrderStatusOperatorDto implements IOrder {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsEnum(OrderStatusOperator)
    status: string;
}

export class UpdateOrderStatusAdminDto {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @IsEnum(OrderStatusAdmin)
    newStatus: string;
}

export class UpdateOrderAdminDto implements IOrder {
    @IsString()
    @IsEnum(OrderStatusAdmin)
    status?: string;

    @IsString()
    note?: string;

    @IsString()
    address?: string;

    @IsString()
    extra_info?: string;

    @IsString()
    message?: string;

    @IsNumber()
    city_id?: number;

    @IsNumberString()
    referal_price?: number;

    @IsString()
    name?: string;

    @IsString()
    @IsPhoneNumber({ message: 'Telefon raqami xato kiritildi' })
    phone?: string;

    @IsBoolean()
    isTaken?: boolean;

    @IsString()
    takenById?: string;

    @IsString()
    prevStatus?: string;
}

export class UpadetOrderAdminMany {
    @IsDefined()
    @IsArray()
    @ArrayNotEmpty()
    orders: string[];

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    status: string;
}

export class UpadetOrderAdminManyByStatus {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    oldStatus: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    newStatus: string;
}

export class DeleteOrderDto {
    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    variantId: number;
}
