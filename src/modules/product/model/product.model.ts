import mongoose from 'mongoose';
import { IProduct } from '../interface/product.interface';
import AutoIncrementFactory from 'mongoose-sequence';
import { title } from 'process';
const AutoIncrement = AutoIncrementFactory(mongoose);

const productSchema = new mongoose.Schema<IProduct>(
    {
        title: {
            uz: { type: String, required: true },
            ru: { type: String, required: true },
            en: { type: String, required: true },
        },
        category: {
            type: Number,
            ref: 'categories',
            required: [true, 'Kategoriyani tanlang'],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId
        },
        positions: [{ type: String }],
        images: [
            {
                image: {
                    '800': {
                        high: { type: String, required: true },
                        low: { type: String, required: true },
                    },
                    '720': {
                        high: { type: String, required: true },
                        low: { type: String, required: true },
                    },
                    '540': {
                        high: { type: String, required: true },
                        low: { type: String, required: true },
                    },
                    '240': {
                        high: { type: String, required: true },
                        low: { type: String, required: true },
                    },
                    '80': {
                        high: { type: String, required: true },
                        low: { type: String, required: true },
                    },
                },
                imageKey: { type: String, required: true },
                color: { type: String },
                hasVerticalPhoto: { type: String, default: false },
            },
        ],
        description: {
            uz: { type: String, required: true },
            ru: { type: String, required: true },
            en: { type: String, required: true },
        },
        sizesDescription: {
            uz: { type: String },
            ru: { type: String },
            en: { type: String },
        },
        featureDescription: {
            uz: { type: String },
            ru: { type: String },
            en: { type: String },
        },
        blocked: { type: Boolean, default: false },
        blockingReason: { type: String },
        brand: { type: Number, default: null },
        allowMarket: { type: Boolean, default: false },
        reviewsAmount: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
        },
        video: { type: String, default: null },
        adult: { type: Boolean, default: false },
        madeIn: { type: String, default: null },
        uid: { type: Number },
        discountBadges: [{ type: Number }],
        characteristics: [
            {
                uid: { type: Number },
                values: [
                    {
                        uid: { type: Number },
                    },
                ],
            },
        ],
        sku: { type: String },
    },
    {
        timestamps: true,
    }
);

productSchema.plugin(AutoIncrement, {
    id: 'product_counter',
    inc_field: 'uid',
    start_seq: 10000,
});

export const ProductModel = mongoose.model<IProduct>('products', productSchema);
