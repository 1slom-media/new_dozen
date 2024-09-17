import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { protect } from '../shared/middlewares/protect';
import ExpoController from './expo.controller';
import CreateExpoToken from './dto/expo.dto';

export default class ExpoRoute implements Routes {
    public path = '/expo';
    public router = Router();
    public expoController = new ExpoController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/add`,
            protect,
            validate(CreateExpoToken, 'body', true),
            this.expoController.create
        );
    }
}
