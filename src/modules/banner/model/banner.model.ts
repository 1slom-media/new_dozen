import mongoose from 'mongoose';
import { IBanner } from '../interface/banner.interface';

const bannersSchema = new mongoose.Schema<IBanner>(
    {
        productId: {
            type: Number,
            required: [true, 'Maxsulotni tanlang'],
        },
        image: { type: String, required: true },
        active: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

export const BannerModel = mongoose.model<IBanner>('banners', bannersSchema);
