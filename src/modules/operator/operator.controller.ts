import UserService from 'modules/user/user.service';
import OperatorService from './operator.service';
import { NextFunction, Request, Response } from 'express';
import { UpdateOperatorDto, UpdateUserDto } from '../user/dto/user.dto';
import OrderService from '../order/order.service';
import { AuthDto, CheckCodeDto, SignInDto } from '../auth/dto/auth.dto';
import {
    CreateOrderDto,
    UpdateOrderOperatorDto,
    UpdateOrderStatusOperatorDto,
} from '../order/dto/order.dto';
import extractQuery from '../shared/utils/extractQuery';
import ErrorResponse from '../shared/utils/errorResponse';
import { ISearchQuery } from '../shared/interface/query.interface';
import { uploadFile } from '../shared/utils/uploadFile';
import { notificationPusher } from '../shared/utils/expo';
import SettingService from '../setting/setting.service';

export default class OperatorController {
    private operatorService = new OperatorService();
    private orderService = new OrderService();
    private settingService = new SettingService();

    public updateProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                name,
                avatar,
                region,
                email,
                surname,
                nickname,
            }: UpdateOperatorDto = req.body;
            var userData = {
                name,
                avatar,
                region,
                email,
                surname,
            };

            if (req['files']) {
                const image = await uploadFile(req['files']['avatar']);
                if (image && image[0]) userData.avatar = image[0];
            }
            const data = await this.operatorService.updateProfile(
                req.body.user_id,
                userData
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.body.user_id;
            const orderCount = await this.orderService.operatorOrderCount(
                userId
            );
            const user = await this.operatorService.findOne(userId);

            res.status(200).json({ orderCount, user });
        } catch (error) {
            next(error);
        }
    };

    public SignWithPhone = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone }: AuthDto = req.body;

            const data = await this.operatorService.SignWithPhone(phone);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public CheckSms = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { phone, code }: CheckCodeDto = req.body;

            const data = await this.operatorService.CheckCode(phone, code);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getAllByStatus('new', false);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public createOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                name,
                orderItems,
                city_id,
                phone,
                address,
                extra_info,
            }: CreateOrderDto = req.body;
            const data = await this.orderService.create({
                name,
                orderItems,
                city_id,
                phone,
                address,
                extra_info,
                isTaken: true,
                takenById: req.body.user_id,
                status: 'ready',
            });

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public operatorOrders = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { status } = extractQuery(query).sorts;
            const orders = await this.orderService.getOperatorOrderProduct(
                req.body.user_id,
                status
            );
            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    };

    public resetOperatorOrders = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            await this.orderService.resetOperatorOrders(id);
            res.status(200).json({
                message: `Buyurtmalar "olinmagan" holatiga o'tkazildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public operatorOrdersCount = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const data = await this.orderService.getOperatorOrderProductCount(
                req.body.user_id
            );
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getWithNumber = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;
            const order = await this.orderService.getWithNumber(
                req.body.user_id,
                Number(number)
            );
            res.status(200).json(order ? order : []);
        } catch (error) {
            next(error);
        }
    };

    public getOneOperatorOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const order = await this.orderService.getOneOperatorOrderMobile(
                req.body.user_id,
                id
            );
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    };

    public searchOrderOperator = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const orders = await this.orderService.searchOrderOperator(
                req.body.user_id,
                filter
            );
            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    };

    public receiveOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { isTaken, status } = await this.orderService.getOneOrder(id);
            if (isTaken)
                throw new ErrorResponse(500, 'Bu buyurtma allaqachon olingan!');
            if (status !== 'new')
                throw new ErrorResponse(500, 'Buyurtma eski bolishi mumkin!');

            const access =
                await this.orderService.operatorNewOrdersLastFiveMinutes(
                    req.body.user_id
                );
            if (!access)
                throw new ErrorResponse(
                    400,
                    'Gaplashilmagan buyurtmalar soni oshib ketgan!'
                );
            const order = await this.orderService.updateOrder(id, {
                isTaken: true,
                takenById: req.body.user_id,
            });
            // const setting = await this.settingService.getSetting();
            // setTimeout(async () => {
            //     let receivedOrder = await this.orderService.getOneOrder(id);
            //     if (receivedOrder.status === 'new') {
            //         notificationPusher(
            //             'Jarima oldingiz!',
            //             'Buyurtmani qabul qilgandan keyin buyutmachi bilan gaplashmaganlikda ayblanyabsiz !'
            //         );

            //         let operator = await this.operatorService.findOne(
            //             req.body.user_id
            //         );
            //         await this.operatorService.updateProfile(req.body.user_id, {
            //             balance:
            //                 operator.balance - setting[0]?.penaltyOperator
            //                     ? setting[0]?.penaltyOperator
            //                     : 0,
            //         });

            //         await this.orderService.updateOrder(id, {
            //             isTaken: false,
            //             takenById: null,
            //         });
            //     }
            // }, 7200000);
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    };

    public resetReceiveOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { isTaken } = await this.orderService.getOneOperatorOrder(
                req.body.user_id,
                id
            );
            if (!isTaken)
                throw new ErrorResponse(500, 'Bu buyurtma allaqachon bosh!');
            const order = await this.orderService.updateOrder(
                req.body.user_id,
                { isTaken: false, takenById: null }
            );
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    };

    public updateReceivedOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const {
                status,
                city_id,
                address,
                extra_info,
                message,
                orderItems,
            }: UpdateOrderOperatorDto = req.body;
            const order = await this.orderService.updateOrderOperator(
                req.body.user_id,
                id,
                {
                    status,
                    city_id,
                    address,
                    extra_info,
                    message,
                    orderItems,
                }
            );
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    };

    public updateReceivedOrderStatus = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { status }: UpdateOrderStatusOperatorDto = req.body;
            const order = await this.orderService.updateOrderStatusOperator(
                req.body.user_id,
                id,
                {
                    status,
                }
            );
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    };
}
