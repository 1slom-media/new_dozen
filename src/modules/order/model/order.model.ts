import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../interface/order.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const orderSchema = new mongoose.Schema<IOrder>(
    {
        orderItems: [
            {
                quantity: {
                    type: Number,
                    required: [true, 'Mahsulot sonini kiriting'],
                },
                price: {
                    type: Number,
                },
                variantId: {
                    type: Schema.Types.Number,
                    required: [true, 'Maxsulotni kiriting'],
                },
            },
        ],
        userId: {
            type: Number,
            ref: 'users',
        },
        number: {
            type: Number,
        },
        name: {
            type: String,
            required: [true, 'Ismingizni kiriting'],
        },
        phone: {
            type: String,
            required: [true, 'telefon raqamingizni kiriting'],
        },
        city_id: {
            type: Number,
            required: [true, 'Manzilingizni kiriting'],
        },
        streamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'stream',
        },
        status: {
            type: String,
            enum: [
                'new',
                'ready',
                'onway',
                'delivered',
                'canceled',
                'pending',
                'hold',
                'archived',
            ],
            default: 'new',
        },
        address: {
            type: String,
        },
        extra_info: {
            type: String,
        },
        message: {
            type: String,
        },
        referal_price: {
            type: Number,
            default: 0,
        },
        prevStatus: {
            type: String,
        },
        isTaken: {
            type: Boolean,
            default: false,
        },
        takenById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        isOutSource: { type: Boolean, default: false },
        user_ip: { type: String },
    },
    {
        timestamps: true,
    }
);

orderSchema.plugin(AutoIncrement, { id: 'order_counter', inc_field: 'number' });

export const OrderModel = mongoose.model<IOrder>('orders', orderSchema);
