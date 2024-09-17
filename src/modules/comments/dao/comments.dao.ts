import mongoose from 'mongoose';
import { IComment } from '../interface/comments.interface';
import { CommentModel } from '../model/comments.model';
import { CreateReplyDto, UpdateCommentDto } from '../dto/comments.dto';

export class CommentsDao {
    async create(values: IComment) {
        const comment = new CommentModel(values);
        return await comment.save();
    }

    async getProductComments(productId: string, page: number, limit: number) {
        const countPage = await CommentModel.find({
            productId: productId,
        }).count();

        const comments = await CommentModel.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(productId),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'replies',
                    foreignField: '_id',
                    as: 'replies',
                },
            },
            {
                $addFields: {
                    user: { $first: '$user.name' },
                },
            },
            {
                $project: {
                    rating: 1,
                    user: 1,
                    text: 1,
                    replies: 1,
                    images: 1,
                    _id: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);

        return { countPage: Math.ceil(countPage / limit), comments };
    }

    async getrating(productId: string) {
        const count = await CommentModel.find({
            productId: new mongoose.Types.ObjectId(productId),
        }).count();

        const sumOfRating = await CommentModel.aggregate([
            {
                $match: {
                    isReply: false,
                    isAdmin: false,
                    productId: new mongoose.Types.ObjectId(productId),
                },
            },
            {
                $group: {
                    _id: null,
                    totalRating: { $sum: '$rating' },
                },
            },
        ]);

        return sumOfRating[0].totalRating / count;
    }

    async createReply(values: IComment, commentId: string) {
        var foundComment = await CommentModel.findById(commentId);
        const comment = new CommentModel(values);
        await comment.save();

        foundComment.replies.push(comment);
        await foundComment.save();
        return comment;
    }

    async deleteComment(commentId: string) {
        return await CommentModel.findByIdAndDelete(commentId);
    }

    async updateComment(commentId: string, values: UpdateCommentDto) {
        return await CommentModel.findByIdAndUpdate(commentId, values, {
            new: true,
        });
    }

    async findCommentById(commentId: string, userId: string) {
        return await CommentModel.findOne({ user: userId, _id: commentId });
    }

    async findOne(commentId: string) {
        return await CommentModel.findById(commentId);
    }
}
