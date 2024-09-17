import mongoose from 'mongoose';
import { IPost } from '../interface/posts.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const postsSchema = new mongoose.Schema<IPost>(
    {
        channelId: {
            type: mongoose.Types.ObjectId,
            ref: 'channels',
            required: true,
        },
        chatId: { type: Number },
        time: { type: String },
        postItems: { type: Array, required: true },
        isActive: { type: Boolean, default: true },
        type: { type: String },
        uid: { type: Number, unique: true },
    },
    {
        timestamps: true,
    }
);

postsSchema.plugin(AutoIncrement, {
    id: 'post_counter',
    inc_field: 'uid',
});

export const PostModel = mongoose.model<IPost>('posts', postsSchema);
