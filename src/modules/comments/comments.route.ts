import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import { CommentsController } from './comments.controller';
import { isAdmin, protect } from '../shared/middlewares/protect';
import validate from '../shared/middlewares/validate';
import {
    CreateCommentDto,
    CreateReplyDto,
    UpdateCommentDto,
} from './dto/comments.dto';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import imageValidationMiddleware from '../shared/middlewares/validateImages';

export class CommentsRoute implements Routes {
    public path = '/comments';
    public router = Router();
    public commentsController = new CommentsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            protect,
            validate(CreateCommentDto, 'body', true),
            this.commentsController.create
        );
        this.router.get(
            `${this.path}/:id`,
            validate(ValidateParamsDTO, 'params'),
            this.commentsController.getComments
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.commentsController.delete
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            imageValidationMiddleware('image'),
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateCommentDto, 'body', true),
            this.commentsController.update
        );
        this.router.post(
            `${this.path}/:id`,
            protect,
            isAdmin,
            imageValidationMiddleware('image'),
            validate(ValidateParamsDTO, 'params'),
            validate(CreateReplyDto, 'body', true),
            this.commentsController.createReply
        );
    }
}
