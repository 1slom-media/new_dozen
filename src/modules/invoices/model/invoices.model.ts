import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import { IInvoices } from '../interface/invoices.interface';
const AutoIncrement = AutoIncrementFactory(mongoose);

const invoicesSchema = new mongoose.Schema<IInvoices>(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'orders',
            required: true,
        },
        uid: { type: Number, unique: true },
    },
    {
        timestamps: true,
    }
);

invoicesSchema.plugin(AutoIncrement, {
    id: 'invoices_counter',
    inc_field: 'uid',
    start_seq: 1000,
});

export const InvoicesModel = mongoose.model<IInvoices>(
    'invoices',
    invoicesSchema
);
