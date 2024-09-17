import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import BlackListController from './blacklist.controller';
import { CreateBlackListDto, UpdateBlackListDto } from './dto/blacklist.dto';

export default class BlackListRoute implements Routes {
    public path = '/blacklist';
    public router = Router();
    public blackListController = new BlackListController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/`,
            protect,
            isAdmin,
            this.blackListController.getAll
        );
        this.router.post(
            `${this.path}/add`,
            protect,
            isAdmin,
            validate(CreateBlackListDto, 'body', true),
            this.blackListController.create
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateBlackListDto, 'body', true),
            this.blackListController.update
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.blackListController.delete
        );
    }
}
