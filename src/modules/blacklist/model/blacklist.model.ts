import mongoose from 'mongoose';
import { IBlacklist } from '../interface/blacklist.interface';

const blackListSchema = new mongoose.Schema<IBlacklist>(
    {
        name: { type: String },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        isBlock: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export const BlackListModel = mongoose.model<IBlacklist>(
    'blacklist',
    blackListSchema
);
