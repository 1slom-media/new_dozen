import mongoose from 'mongoose';
import { IStetting } from '../interface/setting.interface';

const settingSchema = new mongoose.Schema<IStetting>({
    sitePhone: {
        type: String,
    },
    address: {
        type: String,
    },
    tgLink: {
        type: String,
    },
    logo: {
        type: String,
    },
    instaLink: {
        type: String,
    },
    fbLink: {
        type: String,
    },
    paymentOperator: {
        type: Number,
        default: 6000,
    },
    penaltyOperator: {
        type: Number,
        default: 0,
    },
    ad_price: {
        type: Number,
        default: 0,
    },
    delivery_price: {
        type: Number,
        default: 0,
    },
    eskiz_token: {
        type: String,
    },
    marketingGroup: { type: String },
    supportBot: { type: String },
    supportPhone: { type: String },
    highestPriceForCheapProducts: { type: Number, default: 150000 },
});

export const SettingModel = mongoose.model<IStetting>(
    'settings',
    settingSchema
);
