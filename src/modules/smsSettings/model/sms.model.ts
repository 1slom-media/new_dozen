import mongoose from 'mongoose';
import { ISms } from '../interface/sms.interface';

const smsSchema = new mongoose.Schema<ISms>(
    {
        archived: {
            type: Boolean,
            default: false,
        },
        canceled: {
            type: Boolean,
            default: false,
        },
        delivered: {
            type: Boolean,
            default: false,
        },
        hold: {
            type: Boolean,
            default: false,
        },
        onway: {
            type: Boolean,
            default: false,
        },
        pending: {
            type: Boolean,
            default: false,
        },
        ready: {
            type: Boolean,
            default: false,
        },
        fulfilled: {
            type: Boolean,
            default: false,
        },
        rejected: {
            type: Boolean,
            default: false,
        },
        new_payment: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const SmsModel = mongoose.model<ISms>('sms_service', smsSchema);
