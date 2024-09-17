import mongoose from 'mongoose';
import { ISubFeature } from '../interface/subfeatures.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const subFeatureSchema = new mongoose.Schema<ISubFeature>(
    {
        title: {
            uz: { type: String, required: true },
            ru: { type: String, required: true },
            en: { type: String, required: true },
        },
        charId: {
            type: Number,
            ref: 'features',
            required: [true, 'Xususiyatni tanlang'],
        },
        value: {
            type: String,
            required: true,
        },
        isColor: {
            type: Boolean,
            default: false,
        },
        uid: { type: Number, unique: true },
        sku: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

subFeatureSchema.plugin(AutoIncrement, {
    id: 'subfeature_counter',
    inc_field: 'uid',
    start_seq: 10000,
});

export const SubFeatureModel = mongoose.model<ISubFeature>(
    'subfeatures',
    subFeatureSchema
);
