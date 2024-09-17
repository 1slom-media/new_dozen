import { Router } from 'express';
import validate from '../shared/middlewares/validate';
import { Routes } from '../shared/interface/routes.interface';
import { isAdmin, protect } from '../shared/middlewares/protect';
import { ValidateParamsNumberDTO } from '../shared/dto/params.dto';
import { BrandsController } from './brands.controller';
import { BrandsDto } from './dto/brands.dto';

export default class BrandsRoute implements Routes {
    public path = '/brands';
    public router = Router();
    public controller = new BrandsController();

    constructor() {
        this.initializeRoutes();
    }
    public initializeRoutes() {
        this.router.post(
            this.path,
            protect,
            isAdmin,
            validate(BrandsDto, 'body', true),
            this.controller.create
        );
        this.router.put(
            `${this.path}/:number`,
            protect,
            isAdmin,
            validate(ValidateParamsNumberDTO, 'params'),
            validate(BrandsDto, 'body', true),
            this.controller.update
        );
        this.router.get(`${this.path}/`, this.controller.findAll);
        this.router.get(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.controller.findOne
        );
        this.router.delete(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.controller.delete
        );
    }
}
