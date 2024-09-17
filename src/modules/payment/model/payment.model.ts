import mongoose from 'mongoose';
import { IPayment } from '../interface/payment.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const paymentSchema = new mongoose.Schema<IPayment>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'users',
        },
        card: {
            type: String,
            required: [true, 'Karta raqamini kiriting!'],
            minLength: [14, 'Eng kamida 14 ta belgi bulishi kerak'],
        },
        amount: {
            type: Number,
            required: [true, "To'lovni kiriting"],
            min: [50000, "Eng kam to'lov 50000 dan kam bo'lmasligi kerak"],
        },
        message: {
            type: String,
            default: 'Xabar qoldirilmagan!',
        },
        status: {
            type: String,
            default: 'accepted',
            enum: ['accepted', 'waiting', 'fulfilled', 'rejected'],
        },
        uid: { type: Number, unique: true },
    },
    {
        timestamps: true,
    }
);

paymentSchema.plugin(AutoIncrement, {
    id: 'payments_counter',
    inc_field: 'uid',
    start_seq: 100,
});

export const PaymentModel = mongoose.model<IPayment>('payments', paymentSchema);
