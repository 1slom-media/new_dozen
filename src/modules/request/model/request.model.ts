import mongoose from 'mongoose';
import { IRequest } from '../interface/request.interface';

const requestSchema = new mongoose.Schema<IRequest>(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'order',
        },
        msg: {
            type: String,
            required: [true, 'Xabar kiriting'],
        },
    },
    {
        timestamps: true,
    }
);

export const RequestModel = mongoose.model<IRequest>('requests', requestSchema);
