import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import { isAdmin, protect } from '../shared/middlewares/protect';
import { InvoicesController } from './invoices.controller';

export default class InvoicesRoute implements Routes {
    public path = '/invoices';
    public router = Router();
    public invoicesController = new InvoicesController();

    constructor() {
        this.initializeRoutes();
    }
    public initializeRoutes() {
        this.router.get(
            `${this.path}/`,
            protect,
            isAdmin,
            this.invoicesController.getAll
        );
    }
}
