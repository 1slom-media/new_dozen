import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import PaymentController from './payment.controller';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

export default class PaymentRoute implements Routes {
    public path = '/payment';
    public router = Router();
    public paymentController = new PaymentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/user-payment`,
            protect,
            this.paymentController.getAll
        );
        this.router.get(
            `${this.path}/admin-payment`,
            protect,
            isAdmin,
            this.paymentController.getAllAdmin
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdatePaymentDto, 'body', true),
            this.paymentController.update
        );
        this.router.post(
            `${this.path}/add`,
            protect,
            validate(CreatePaymentDto, 'body', true),
            this.paymentController.create
        );
    }
}
