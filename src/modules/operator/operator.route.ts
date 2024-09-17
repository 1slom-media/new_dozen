import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import {
    ValidateParamsDTO,
    ValidateParamsNumberDTO,
} from '../shared/dto/params.dto';
import { isAdmin, isOperator, protect } from '../shared/middlewares/protect';
import OperatorController from './operator.controller';
import { UpdateOperatorDto } from '../user/dto/user.dto';
import PaymentController from '../payment/payment.controller';
import { CreatePaymentDto } from '../payment/dto/payment.dto';
import {
    CreateOrderDto,
    UpdateOrderOperatorDto,
    UpdateOrderStatusOperatorDto,
} from '../order/dto/order.dto';
import { AuthDto, CheckCodeDto } from '../auth/dto/auth.dto';
import imageValidationMiddleware from '../shared/middlewares/validateImages';

export default class OperatorRoute implements Routes {
    public path = '/operator';
    public router = Router();
    public operatorController = new OperatorController();
    public paymentController = new PaymentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/auth/phone`,
            validate(AuthDto, 'body', true),
            this.operatorController.SignWithPhone
        );
        this.router.post(
            `${this.path}/auth/check`,
            validate(CheckCodeDto, 'body', true),
            this.operatorController.CheckSms
        );
        this.router.get(
            `${this.path}/profile`,
            protect,
            isOperator,
            this.operatorController.getProfile
        );
        this.router.put(
            `${this.path}/profile`,
            protect,
            isOperator,
            imageValidationMiddleware('avatar'),
            validate(UpdateOperatorDto, 'body'),
            this.operatorController.updateProfile
        );
        this.router.get(
            `${this.path}/payment`,
            protect,
            isOperator,
            this.paymentController.getAll
        );
        this.router.post(
            `${this.path}/payment`,
            protect,
            isOperator,
            validate(CreatePaymentDto, 'body', true),
            this.paymentController.create
        );
        this.router.get(
            `${this.path}/order`,
            protect,
            isOperator,
            this.operatorController.getAllOrder
        );
        this.router.post(
            `${this.path}/order`,
            protect,
            isOperator,
            validate(CreateOrderDto, 'body', true),
            this.operatorController.createOrder
        );
        this.router.get(
            `${this.path}/order/my`,
            protect,
            isOperator,
            this.operatorController.operatorOrders
        );
        this.router.get(
            `${this.path}/order/my-count`,
            protect,
            isOperator,
            this.operatorController.operatorOrdersCount
        );
        this.router.get(
            `${this.path}/order/number/:number`,
            protect,
            isOperator,
            validate(ValidateParamsNumberDTO, 'params'),
            this.operatorController.getWithNumber
        );
        this.router.get(
            `${this.path}/order/my/:id`,
            protect,
            isOperator,
            validate(ValidateParamsDTO, 'params'),
            this.operatorController.getOneOperatorOrder
        );
        this.router.get(
            `${this.path}/order/search`,
            protect,
            isOperator,
            this.operatorController.searchOrderOperator
        );
        this.router.put(
            `${this.path}/order/taken/:id`,
            protect,
            isOperator,
            validate(ValidateParamsDTO, 'params'),
            this.operatorController.receiveOrder
        );
        this.router.put(
            `${this.path}/order/renew/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.operatorController.resetOperatorOrders
        );
        this.router.put(
            `${this.path}/order/reset/:id`,
            protect,
            isOperator,
            validate(ValidateParamsDTO, 'params'),
            this.operatorController.resetReceiveOrder
        );
        this.router.put(
            `${this.path}/order/:id`,
            protect,
            isOperator,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateOrderOperatorDto, 'body', true),
            this.operatorController.updateReceivedOrder
        );
        this.router.put(
            `${this.path}/order/status/:id`,
            protect,
            isOperator,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateOrderStatusOperatorDto, 'body', true),
            this.operatorController.updateReceivedOrderStatus
        );
    }
}
