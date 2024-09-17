export interface IOrderItem {
    quantity: number;
    variantId: number;
    price?: number;
}
export interface IOrder {
    name?: string;
    phone?: string;
    city_id?: number;
    orderItems?: IOrderItem[];
    userId?: any;
    number?: number;
    streamId?: any;
    status?: string;
    address?: string;
    extra_info?: string;
    message?: string;
    referal_price?: number;
    prevStatus?: string;
    isTaken?: boolean;
    takenById?: any;
    isOutSource?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    user_ip?: string;
}
