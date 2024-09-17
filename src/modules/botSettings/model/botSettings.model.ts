import mongoose from 'mongoose';
import { BotSettings } from '../interface/botSettings.inreface';

const botSchema = new mongoose.Schema<BotSettings>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'stream',
            required: true,
        },
        archived: { type: Boolean, default: false },
        canceled: { type: Boolean, default: false },
        delivered: { type: Boolean, default: false },
        hold: { type: Boolean, default: false },
        onway: { type: Boolean, default: false },
        payment: { type: Boolean, default: false },
        pending: { type: Boolean, default: false },
        ready: { type: Boolean, default: false },
        new_product: { type: Boolean, default: false },
        new_order: { type: Boolean, default: false },
        update_product: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

export const BotModel = mongoose.model<BotSettings>('bot_settings', botSchema);
