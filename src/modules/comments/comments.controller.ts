import { NextFunction, Request, Response } from 'express';
import { CommentsService } from './comments.service';
import extractQuery from '../shared/utils/extractQuery';
import {
    CreateCommentDto,
    CreateReplyDto,
    UpdateCommentDto,
} from './dto/comments.dto';
import { uploadFile } from '../shared/utils/uploadFile';

export class CommentsController {
    private commentsService = new CommentsService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const commentData: CreateCommentDto = req.body;
            if (req['files'] && req['files']['image']) {
                const images = await uploadFile(req['files']['image']);
                commentData.image = images;
            }

            await this.commentsService.create(commentData, req.body.user_id);

            res.status(201).json({
                message: 'Baholash muvaffaqqiyatli saqlandi.',
            });
        } catch (err) {
            next(err);
        }
    };

    public createReply = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const commentData: CreateReplyDto = req.body;
            if (req['files'] && req['files']['image']) {
                const images = await uploadFile(req['files']['image']);
                commentData.images = images;
            }
            await this.commentsService.createReply(
                id,
                commentData,
                req.body.user_id
            );

            res.status(201).json({
                message: 'Baholash muvaffaqqiyatli saqlandi.',
            });
        } catch (err) {
            next(err);
        }
    };

    public getComments = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { limit, page } = extractQuery(req.query).sorts;
            const data = await this.commentsService.getProductComments(
                req.params.id,
                page,
                limit
            );

            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    };

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const commentData: UpdateCommentDto = req.body;
            if (req['files'] && req['files']['image']) {
                const images = await uploadFile(req['files']['image']);
                commentData.image = images;
            }

            const data = await this.commentsService.updateComment(
                id,
                req.body.user_id,
                commentData
            );

            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    };

    public delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            await this.commentsService.deleteComment(id);

            res.status(201).json({
                message: 'Komment muvaffaqqiuyatli ochirildi',
            });
        } catch (err) {
            next(err);
        }
    };
}
