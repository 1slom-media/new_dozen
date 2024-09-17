import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';
import { IBrand } from '../interface/brands.interface';
const AutoIncrement = AutoIncrementFactory(mongoose);

const brandsSchema = new mongoose.Schema<IBrand>(
    {
        title: { type: String, required: true },
        uid: { type: Number },
    },
    {
        timestamps: true,
    }
);

brandsSchema.plugin(AutoIncrement, {
    id: 'brands_counter',
    inc_field: 'uid',
    start_seq: 10000,
});

export const BrandsModel = mongoose.model<IBrand>('brands', brandsSchema);
