import mongoose from 'mongoose';
import { ISession } from '../interface/sessions.interface';

const sessionSchema = new mongoose.Schema<ISession>(
    {
        ip: { type: String, required: true },
        device: { type: String, required: true },
        browser: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
    },
    { timestamps: true }
);

export const SessionModel = mongoose.model<ISession>('sessions', sessionSchema);
