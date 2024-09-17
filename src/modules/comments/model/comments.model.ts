import mongoose from 'mongoose';
import { IComment } from '../interface/comments.interface';

const commetSchema = new mongoose.Schema<IComment>(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        isReply: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comments' }],
        images: [{ type: String }],
    },
    { timestamps: true }
);

export const CommentModel = mongoose.model<IComment>('comments', commetSchema);
