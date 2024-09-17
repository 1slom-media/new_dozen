import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import { protect } from '../shared/middlewares/protect';
import RequsetController from './requset.controller';

export default class RequestRoute implements Routes {
    public path = '/request';
    public router = Router();
    public requestController = new RequsetController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/`,
            protect,
            this.requestController.getAll
        );
    }
}
