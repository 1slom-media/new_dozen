import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import {
    ValidateParamsDTO,
    ValidateParamsNumberDTO,
} from '../shared/dto/params.dto';
import { protect } from '../shared/middlewares/protect';
import StreamController from './stream.controller';
import {
    CreateStreamDto,
    UpdateStreamDto,
    UpdateStreamForUser,
} from './dto/stream.dto';

export default class StreamRoute implements Routes {
    public path = '/stream';
    public router = Router();
    public streamController = new StreamController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, protect, this.streamController.getAll);

        this.router.post(
            `${this.path}/`,
            protect,
            validate(CreateStreamDto, 'body', true),
            this.streamController.create
        );
        this.router.put(
            `${this.path}/:number`,
            protect,
            validate(ValidateParamsNumberDTO, 'params'),
            validate(UpdateStreamForUser, 'body', true),
            this.streamController.updateForUser
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            validate(ValidateParamsDTO, 'params'),
            this.streamController.delete
        );
        this.router.get(
            `${this.path}/statistics`,
            protect,
            this.streamController.getDetailStreams
        );
        this.router.get(
            `${this.path}/details/:number`,
            protect,
            validate(ValidateParamsNumberDTO, 'params'),
            this.streamController.getDetailStream
        );
        this.router.get(
            `${this.path}/number`,
            protect,
            this.streamController.getAllStreamNumber
        );
        this.router.get(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.streamController.findOne
        );
    }
}
