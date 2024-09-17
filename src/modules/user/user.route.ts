import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import UserController from './user.controller';
import { CreateUserDto, UpdateDeposit, UpdateUserDto } from './dto/user.dto';
import imageValidationMiddleware from '../shared/middlewares/validateImages';

export default class UserRoute implements Routes {
    public path = '/user';
    public router = Router();
    public userController = new UserController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // which get all users for admin
        this.router.get(
            `${this.path}/`,
            protect,
            isAdmin,
            this.userController.getAllUsers
        );
        // which get all operators for admin
        this.router.get(
            `${this.path}/operator`,
            protect,
            isAdmin,
            this.userController.getAllOperators
        );
        this.router.get(
            `${this.path}/operator/statistics`,
            protect,
            isAdmin,
            this.userController.operatorStatistics
        );
        this.router.get(
            `${this.path}/statistics`,
            protect,
            isAdmin,
            this.userController.userStatistics
        );
        // get user profile information for users
        this.router.get(
            `${this.path}/profile`,
            protect,
            this.userController.getProfile
        );
        this.router.get(
            `${this.path}/search`,
            protect,
            isAdmin,
            this.userController.searchGlobal
        );
        // edit user profile information for users
        this.router.put(
            `${this.path}/profile`,
            imageValidationMiddleware('avatar'),
            protect,
            validate(UpdateUserDto, 'body', true),
            this.userController.updateForUser
        );
        // edit user profile information for admin
        this.router.put(
            `${this.path}/admin/:id`,
            protect,
            isAdmin,
            validate(UpdateUserDto, 'body', true),
            this.userController.updateForAdmin
        );
        this.router.put(
            `${this.path}/admin/deposit/:id`,
            protect,
            isAdmin,
            validate(UpdateDeposit, 'body', true),
            this.userController.updateDeposit
        );
        this.router.post(
            `${this.path}/admin/add-operator`,
            protect,
            isAdmin,
            validate(CreateUserDto, 'body', true),
            this.userController.create
        );
        // delete user for admin
        this.router.delete(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.userController.delete
        );
    }
}
