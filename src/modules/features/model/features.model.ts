import mongoose from 'mongoose';
import { IFeatures } from '../interface/features.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const featureSchema = new mongoose.Schema<IFeatures>(
    {
        title: {
            uz: { type: String, required: true },
            ru: { type: String, required: true },
            en: { type: String, required: true },
        },
        uid: {
            type: Number,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

featureSchema.plugin(AutoIncrement, {
    id: 'feature_counter',
    inc_field: 'uid',
    start_seq: 1000,
});

export const FeatureModel = mongoose.model<IFeatures>(
    'features',
    featureSchema
);
