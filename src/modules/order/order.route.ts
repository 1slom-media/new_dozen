import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import {
    ValidateParamsDTO,
    ValidateParamsNumberDTO,
} from '../shared/dto/params.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import OrderController from './order.controller';
import {
    AddProductToOrderDto,
    CreateOrderDto,
    CreateOrderV1Dto,
    DeleteOrderDto,
    UpadetOrderAdminMany,
    UpadetOrderAdminManyByStatus,
    UpdateOrderAdminDto,
    UpdateOrderDto,
    UpdateOrderStatusAdminDto,
} from './dto/order.dto';
import { requestChecker } from '../shared/middlewares/requestCheker';
import { requestBanner } from '../shared/middlewares/requestBanner';

export default class OrderRoute implements Routes {
    public path = '/order';
    public router = Router();
    public orderController = new OrderController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/all`,
            protect,
            this.orderController.getAll
        );
        this.router.get(
            `${this.path}/referal-orders`,
            protect,
            this.orderController.getAllReferalOrders
        );
        this.router.post(
            `${this.path}/add/v1`,
            validate(CreateOrderV1Dto, 'body', true), //tugadi
            this.orderController.createV1
        );
        this.router.post(
            `${this.path}/add`,
            requestBanner,
            requestChecker,
            validate(CreateOrderDto, 'body', true), //tugadi
            this.orderController.create
        );
        this.router.post(
            `${this.path}/add/:id`,
            validate(ValidateParamsDTO, 'params'),
            validate(AddProductToOrderDto, 'body', true), //tugadi
            this.orderController.addToOrderItems
        );
        this.router.get(
            `${this.path}/request/:id`,
            validate(ValidateParamsDTO, 'params'),
            this.orderController.getProductsCategory
        );
        this.router.delete(
            `${this.path}/delete-product/:id`,
            validate(ValidateParamsDTO, 'params'),
            validate(DeleteOrderDto, 'body', true),
            this.orderController.deleteProductOrder
        );
        this.router.get(
            `${this.path}/admin/getall`,
            protect,
            isAdmin,
            this.orderController.getAllOrderStatusAdmin
        );
        this.router.get(
            `${this.path}/seller/getall`,
            protect,
            this.orderController.getAllOrderStatusSeller
        );
        this.router.put(
            `${this.path}/admin/updateAll`,
            protect,
            validate(UpdateOrderStatusAdminDto, 'body', true),
            this.orderController.updateOrderStatusAdmin
        );
        this.router.get(
            `${this.path}/admin/statistics`,
            protect,
            this.orderController.statistics
        );
        this.router.get(
            `${this.path}/best-sellers`,
            this.orderController.bestSellers
        );
        this.router.get(
            `${this.path}/admin/ready`,
            protect,
            this.orderController.getAllReady
        );
        this.router.get(
            `${this.path}/admin/week`,
            protect,
            this.orderController.getWeekOrders
        );
        this.router.get(
            `${this.path}/admin/city`,
            protect,
            this.orderController.getByCity
        );
        this.router.get(
            `${this.path}/admin-status`,
            protect,
            this.orderController.getStatusCountOrder
        );
        this.router.get(
            `${this.path}/admin-total-balance`,
            protect,
            this.orderController.getTotalBalance
        );
        this.router.get(
            `${this.path}/admin-search`,
            protect,
            this.orderController.getAllSearchOrder
        );
        this.router.get(
            `${this.path}/admin/city/:number`,
            protect,
            validate(ValidateParamsNumberDTO, 'params'),
            this.orderController.getRegionCountOrder
        );
        this.router.put(
            `${this.path}/admin/many`,
            protect,
            validate(UpadetOrderAdminMany, 'body', true),
            this.orderController.updateOrderAdminMany
        );
        this.router.put(
            `${this.path}/admin/many/by-status`,
            protect,
            validate(UpadetOrderAdminManyByStatus, 'body', true),
            this.orderController.updateOrderAdminManyByStatus
        );
        this.router.put(
            `${this.path}/admin/:id`,
            protect,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateOrderAdminDto, 'body', true),
            this.orderController.updateOrderAdmin
        );
        this.router.get(
            `${this.path}/:id`,
            protect,
            validate(ValidateParamsDTO, 'params'),
            this.orderController.getOneOrder
        );
    }
}
