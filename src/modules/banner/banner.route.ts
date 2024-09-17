import { Router } from 'express';
import validate from '../shared/middlewares/validate';
import { Routes } from '../shared/interface/routes.interface';
import { isAdmin, protect } from '../shared/middlewares/protect';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import imageValidationMiddleware from '../shared/middlewares/validateImages';
import { BannersController } from './banner.controller';
import { CreateBanner, UpdateBanner } from './dto/banner.dto';

export default class BannersRoute implements Routes {
    public path = '/banner';
    public router = Router();
    public controller = new BannersController();

    constructor() {
        this.initializeRoutes();
    }
    public initializeRoutes() {
        this.router.post(
            `${this.path}/`,
            protect,
            isAdmin,
            imageValidationMiddleware('image'),
            validate(CreateBanner, 'body', true),
            this.controller.create
        );
        this.router.get(`${this.path}/`, this.controller.getAll);
        this.router.get(
            `${this.path}/admin`,
            protect,
            isAdmin,
            this.controller.getAllForAdmin
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateBanner, 'body', true),
            this.controller.update
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.controller.delete
        );
    }
}
