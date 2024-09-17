import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import SessionsController from './sessions.controller';

export default class SessionsRoute implements Routes {
    public path = '/sessions';
    public router = Router();
    public sessionsController = new SessionsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}`,
            protect,
            this.sessionsController.getSessions
        );
    }
}
