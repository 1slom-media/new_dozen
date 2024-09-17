import { NextFunction, Request, Response } from 'express';
import OrderService from './order.service';
import {
    AddProductToOrderDto,
    CreateOrderDto,
    CreateOrderV1Dto,
    UpadetOrderAdminMany,
    UpadetOrderAdminManyByStatus,
    UpdateOrderAdminDto,
    UpdateOrderStatusAdminDto,
} from './dto/order.dto';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';

export default class OrderController {
    private orderService = new OrderService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                address,
                city_id,
                extra_info,
                name,
                orderItems,
                phone,
                streamId,
                userId,
            }: CreateOrderDto = req.body;

            const data = await this.orderService.create({
                address,
                city_id,
                extra_info,
                name,
                orderItems,
                phone,
                streamId,
                userId,
            });

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };

    public addToOrderItems = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { variantId }: AddProductToOrderDto = req.body;

            const data = await this.orderService.addToOrderItems(
                req.params.id,
                variantId
            );

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };

    public createV1 = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const productData: CreateOrderV1Dto = req.body;

            const data = await this.orderService.createV1(productData);

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.orderService.getAll(
                req.body.user_id,
                page,
                limit
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getByCity = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getByCity();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllReferalOrders = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.orderService.getAllReferalOrders(
                req.body.user_id,
                page,
                limit,
                filter
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getProductsCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getProductsCategory(
                req.params.id
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    // public addProductOrder = async (
    //     req: Request,
    //     res: Response,
    //     next: NextFunction
    // ): Promise<void> => {
    //     try {
    //         const data = await this.orderService.addProductOrder(
    //             req.params.id,
    //             req.body.productId,
    //             req.body.price
    //         );

    //         res.status(200).json(data);
    //     } catch (error) {
    //         next(error);
    //     }
    // };

    public deleteProductOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.deleteProductOrder(
                req.params.id,
                req.body.variantId
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllOrderStatusAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { limit, page, status, startTime, endTime, region } =
                extractQuery(query).sorts;
            const data = await this.orderService.getAllOrderStatusAdmin(
                String(status),
                page,
                limit,
                startTime,
                endTime,
                region
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public updateOrderStatusAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { newStatus }: UpdateOrderStatusAdminDto = req.body;
            const { status, startTime, endTime, region } =
                extractQuery(query).sorts;
            const orders = await this.orderService.updateOrderStatusAdmin(
                String(status),
                startTime,
                endTime,
                region
            );

            await new Promise(async (resolve, reject) => {
                for await (let order of orders) {
                    await this.orderService.updateOrderAdmin(
                        order._id?.toString(),
                        {
                            status: newStatus,
                        }
                    );
                }
                resolve('success');
            });

            res.status(200).json({
                message: 'Buyurtmalar muvaffaqiyatli tahrirlandi!',
            });
        } catch (error) {
            next(error);
        }
    };

    public statistics = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const sumOfSoldProducts: object = await new Promise(
                async (resolve, _) => {
                    let sum = await this.orderService.getSumOfSoldProducts();
                    resolve(sum);
                }
            );
            const profitValue = await this.orderService.getProfitValue();

            const payments = await this.orderService.getPaidPayment();
            const balance = await this.orderService.getUsersBalance();
            const totalProfit = await this.orderService.getTotalProfitValue();

            res.status(200).json({
                ...sumOfSoldProducts,
                ...profitValue,
                payments,
                ...balance,
                totalProfit,
            });
        } catch (error) {
            next(error);
        }
    };

    public bestSellers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getBestSellers();

            res.status(200).json({ besSellers: data });
        } catch (error) {
            next(error);
        }
    };

    public getAllReady = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getAllReady();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getOneOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getOneOrder(req.params.id);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getWeekOrders = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let nowDate = new Date();
            let lastDate = new Date(new Date(nowDate).getTime() - 604800000);
            const data = await this.orderService.getWeekOrders(
                nowDate,
                lastDate
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getStatusCountOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.userOrderCount();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllSearchOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;

            const data = await this.orderService.getAllSearchOrder(filter);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getRegionCountOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;
            const data = await this.orderService.getRegionCountOrder(
                Number(number)
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public updateOrderAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const values: UpdateOrderAdminDto = req.body;
            const data = await this.orderService.updateOrderAdmin(id, values);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public updateOrderAdminMany = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { status, orders }: UpadetOrderAdminMany = req.body;
            await new Promise(async (resolve, reject) => {
                for await (let order of orders) {
                    await this.orderService.updateOrderAdmin(order, {
                        status,
                    });
                }
                resolve('success');
            });

            res.status(200).json({
                message: 'Buyurtmalar muvaffaqiyatli tahrirlandi!',
            });
        } catch (error) {
            next(error);
        }
    };

    public updateOrderAdminManyByStatus = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { oldStatus, newStatus }: UpadetOrderAdminManyByStatus =
                req.body;
            const orders = await this.orderService.getOrdersIdWithStatus(
                oldStatus
            );
            await new Promise(async (resolve, reject) => {
                for await (let order of orders) {
                    await this.orderService.updateOrderAdmin(order['_id'], {
                        status: newStatus,
                    });
                }
                resolve('success');
            });

            res.status(200).json({
                message: 'Buyurtmalar muvaffaqiyatli tahrirlandi!',
            });
        } catch (error) {
            next(error);
        }
    };
}
