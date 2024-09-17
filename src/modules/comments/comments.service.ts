import { CommentsDao } from './dao/comments.dao';
import { IComment } from './interface/comments.interface';
import ProductService from '../product/product.service';
import UserService from '../user/user.service';
import { CreateReplyDto, UpdateCommentDto } from './dto/comments.dto';
import ErrorResponse from '../shared/utils/errorResponse';

export class CommentsService {
    private commentsDao = new CommentsDao();
    private productService = new ProductService();
    private usersService = new UserService();

    async create(values: IComment, userId: string) {
        const user = await this.usersService.findOne(userId);
        if (user.isAdmin) values.isAdmin = true;
        values.user = userId;
        const comment = await this.commentsDao.create(values);
        const product = await this.productService.findOne(values.productId);
        const rating = await this.commentsDao.getrating(values.productId);
        this.productService.update(values.productId, {
            // votes: product.votes + 1,
            rating,
        });
        return comment;
    }

    async getProductComments(productId: string, page: number, limit: number) {
        return await this.commentsDao.getProductComments(
            productId,
            page,
            limit
        );
    }

    async deleteComment(commentId: string) {
        return await this.commentsDao.deleteComment(commentId);
    }

    async createReply(
        commentId: string,
        values: CreateReplyDto,
        userId: string
    ) {
        const comment = await this.commentsDao.findOne(commentId);
        if (!comment) throw new ErrorResponse(404, 'Komment topilmadi');
        return await this.commentsDao.createReply(
            {
                ...values,
                productId: comment.productId,
                rating: 1,
                user: userId,
                isReply: true,
            },
            commentId
        );
    }

    async updateComment(
        commentId: string,
        userId: string,
        values: UpdateCommentDto
    ) {
        const foundComment = await this.commentsDao.findCommentById(
            commentId,
            userId
        );

        if (!foundComment) throw new ErrorResponse(400, 'Komment topilmadi');

        return await this.commentsDao.updateComment(commentId, values);
    }
}
