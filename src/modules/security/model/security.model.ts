import mongoose from 'mongoose';
import { ISecurity } from '../interface/security.interface';

const securitySchema = new mongoose.Schema<ISecurity>(
    {
        ip: { type: String, required: true },
        lat: { type: String, default: '0' },
        long: { type: String, default: '0' },
        city: { type: String, default: 'none' },
    },
    {
        timestamps: true,
    }
);

export const SecurityModel = mongoose.model<ISecurity>(
    'security',
    securitySchema
);
