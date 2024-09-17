import mongoose from 'mongoose';
import { IExpo } from '../interface/expo.interface';

const expoSchema = new mongoose.Schema<IExpo>(
    {
        userId: { type: String, required: true },
        token: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export const ExpoModel = mongoose.model<IExpo>('expo', expoSchema);
