import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import BotSettingsController from './botSettings.controller';
import { SendMessage, UpdateBotSettingsDto } from './dto/botSettings.dto';

export default class BotSettingsRoute implements Routes {
    public path = '/botsettings';
    public router = Router();
    public botSettingsController = new BotSettingsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/`,
            protect,
            this.botSettingsController.getSettings
        );
        this.router.put(
            `${this.path}/`,
            protect,
            validate(UpdateBotSettingsDto, 'body', true),
            this.botSettingsController.update
        );
        this.router.post(
            `${this.path}/`,
            protect,
            isAdmin,
            validate(SendMessage, 'body', true),
            this.botSettingsController.sendMessage
        );
    }
}
