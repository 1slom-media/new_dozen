import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import SmsServiceController from './sms.controller';
import validate from '../shared/middlewares/validate';
import { UpdateSmsServiceDto } from './dto/sms.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';

export default class SmsServiceRoute implements Routes {
    public path = '/sms-service';
    public router = Router();
    public smsServiceController = new SmsServiceController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.put(
            `${this.path}/`,
            protect,
            isAdmin,
            validate(UpdateSmsServiceDto, 'body', true),
            this.smsServiceController.update
        );
        this.router.get(
            `${this.path}/`,
            protect,
            isAdmin,
            this.smsServiceController.getSmsService
        );
    }
}
