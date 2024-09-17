import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { isAdmin, protect } from '../shared/middlewares/protect';
import { CreateSettingDto } from './dto/setting.dto';
import SettingController from './setting.controller';
import imageValidationMiddleware from '../shared/middlewares/validateImages';

export default class SettingRoute implements Routes {
    public path = '/setting';
    public router = Router();
    public settingController = new SettingController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, this.settingController.getSetting);
        this.router.post(
            `${this.path}/`,
            protect,
            isAdmin,
            imageValidationMiddleware('logo'),
            validate(CreateSettingDto, 'body', true),
            this.settingController.settingAdmin
        );
    }
}
