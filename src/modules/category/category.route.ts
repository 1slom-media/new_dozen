import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import CategoryController from './category.controller';
import validate from '../shared/middlewares/validate';
import { CreateCategoryDto } from './dto/category.dto';
import {
    ValidateParamsDTO,
    ValidateParamsNumberDTO,
} from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import imageValidationMiddleware from '../shared/middlewares/validateImages';

export default class CategoryRoute implements Routes {
    public path = '/category';
    public router = Router();
    public categoryController = new CategoryController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, this.categoryController.getAll);
        this.router.get(
            `${this.path}/admin`,
            protect,
            isAdmin,
            this.categoryController.getAllForAdmin
        );
        this.router.get(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.categoryController.findOne
        );
        this.router.get(
            `${this.path}/only/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.categoryController.getOneCategory
        );
        this.router.get(
            `${this.path}/count/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.categoryController.getCount
        );
        this.router.post(
            `${this.path}/add`,
            protect,
            isAdmin,
            imageValidationMiddleware('avatar'),
            validate(CreateCategoryDto, 'body', true),
            this.categoryController.create
        );
        this.router.post(
            `${this.path}/add/:number`,
            protect,
            isAdmin,
            validate(ValidateParamsNumberDTO, 'params'),
            validate(CreateCategoryDto, 'body', true),
            this.categoryController.createSubCategory
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            isAdmin,
            imageValidationMiddleware('avatar'),
            validate(ValidateParamsDTO, 'params'),
            validate(CreateCategoryDto, 'body', true),
            this.categoryController.update
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.categoryController.delete
        );
    }
}
