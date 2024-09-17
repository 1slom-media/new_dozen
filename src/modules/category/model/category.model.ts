import mongoose from 'mongoose';
import { ICategory } from '../interface/category.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const categorySchema = new mongoose.Schema<ICategory>(
    {
        title: {
            uz: { type: String, required: true },
            ru: { type: String, required: true },
            en: { type: String, required: true },
        },
        avatar: {
            type: String,
        },
        adult: { type: Boolean, default: false },
        parent: { type: Number, default: null },
        uid: { type: Number, unique: true },
    },
    {
        timestamps: true,
    }
);

categorySchema.plugin(AutoIncrement, {
    id: 'categry_counter',
    inc_field: 'uid',
    start_seq: 10000,
});

export const CategoryModel = mongoose.model<ICategory>(
    'categories',
    categorySchema
);
