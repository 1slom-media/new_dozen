import mongoose from 'mongoose';
import { IStream } from '../interface/stream.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const streamSchema = new mongoose.Schema<IStream>(
    {
        name: { type: String, required: [true, 'Oqim nomini kiriting'] },
        number: { type: Number },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        product: {
            type: Number,
            required: [true, 'Maxsulotni kiriting'],
        },
        visits_count: {
            type: Number,
            default: 0,
        },
        isRegionOn: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

streamSchema.plugin(AutoIncrement, {
    id: 'stream_counter',
    inc_field: 'number',
    start_seq: 10000,
});

export const StreamModel = mongoose.model<IStream>('stream', streamSchema);
