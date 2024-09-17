import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import { isAdmin, protect } from '../shared/middlewares/protect';
import SecurityController from './security.controller';

export default class SecurityRoute implements Routes {
    public path = '/security';
    public router = Router();
    public categoryController = new SecurityController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/`,
            protect,
            isAdmin,
            this.categoryController.getAll
        );
    }
}
