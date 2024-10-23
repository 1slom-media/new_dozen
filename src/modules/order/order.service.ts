import { IOrder } from './interface/order.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import OrderDao from './dao/order.dao';
import ProductService from '../product/product.service';
import StreamService from '../stream/stream.service';
import RequestService from '../request/request.service';
import { STATUS_TEXT } from '../../config/consts';
import UserService from '../user/user.service';
import PaymentService from '../payment/payment.service';
import {
    CreateOrderV1Dto,
    UpdateOrderAdminDto,
    UpdateOrderOperatorDto,
    UpdateOrderStatusOperatorDto,
} from './dto/order.dto';
import SettingService from '../setting/setting.service';
import {
    sendOrder,
    sendStreamOrder,
    sendUptatedOrder,
} from '../shared/utils/sendMessage';
import BotSettingsService from '../botSettings/botSettings.service';
import BlackListService from '../blacklist/blacklist.service';
import SmsServiceService from '../smsSettings/sms.service';
import { sendSms } from '../shared/utils/sendSms';
import { subscriptionCheker } from '../shared/utils/checkSubscription';
import { notificationPusher } from '../shared/utils/expo';
import { InvoicesService } from '../invoices/invoices.service';
import SkuService from '../product/sku.service';
import mongoose from 'mongoose';

export default class OrderService {
    private ordersDao = new OrderDao();
    private productService = new ProductService();
    private variantService = new SkuService();
    private streamService = new StreamService();
    private paymentService = new PaymentService();
    private requestService = new RequestService();
    private userService = new UserService();
    private settingService = new SettingService();
    private botSettings = new BotSettingsService();
    private blackList = new BlackListService();
    private smsService = new SmsServiceService();
    private invoicesService = new InvoicesService();

    async create(values: IOrder) {
        const data = await this.blackList.findOne(values.phone);
        if (data && data.isBlock)
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan');

        var message: string;
        values = await new Promise(async (resolve, reject) => {
            for await (const item of values.orderItems) {
                const product = await this.variantService.findOne(
                    item.variantId
                );
                const findProduct= await this.productService.findOne(item.variantId);

                values.referal_price =
                    values.referal_price &&
                    values.referal_price > product?.referalPrice
                        ? product?.referalPrice
                        : values.referal_price;

                item.price = product?.purchasePrice;
                values.sellerPrice=product.sellerPrice;
                values.operatorPrice=product.operatorPrice;
                values.adminPrice=product.adminPrice
                if(findProduct.seller){
                    values.seller=findProduct.seller
                }
                if(findProduct.admin){
                    values.admin=findProduct.admin
                }
            }

            resolve(values);
        });

        const order = await this.ordersDao.create(values);
        await this.invoicesService.create({
            phone: values.phone,
            name: values.name,
            order_id: order._id,
        });
        notificationPusher('Yangi buyurtma!');

        if (values.streamId) {
            const stream = await this.streamService.findById(values.streamId);
            const user = await this.botSettings.getStreamUser(stream.user);
            if (user[0] && !user[0].new_order && !user[0].isAdmin) {
                await sendStreamOrder(user[0].telegramID, order);
            }
        }
        if (message) throw new ErrorResponse(400, message);
        const admins = await this.botSettings.getAllUsers(true);

        admins.forEach(async (admin) => {
            if (!admin.new_order) {
                await sendOrder(admin.telegramID, order);
            }
        });
        return order;
    }

    async addToOrderItems(orderId: string, variantId: number) {
        const order = await this.ordersDao.getOrderById(orderId);

        if (!order)
            throw new ErrorResponse(404, 'Bunday buyurtma mavjud emas!');

        var newOrderItems = order.orderItems.slice();
        if (newOrderItems.some((item) => item.variantId == variantId)) {
            const index = newOrderItems.findIndex(
                (item) => item.variantId == variantId
            );

            newOrderItems[index].quantity += 1;
        } else {
            newOrderItems.push({
                quantity: 1,
                variantId: variantId,
                position:order.orderItems[0].position
            });
        }

        return await this.ordersDao.updateOrder(orderId, {
            orderItems: newOrderItems,
        });
    }

    async createV1(values: CreateOrderV1Dto) {
        let message: string;
        const stream = await this.streamService
            .findOne(values.stream)
            .catch((err) => (message = err.message));
        if (message) throw new ErrorResponse(404, message);
        return await this.create({
            streamId: stream._id,
            orderItems: [
                { quantity: 1, variantId: stream?.product?.skuList[0]?.uid },
            ],
            city_id: 0,
            name: values.name,
            phone: values.phone,
            isOutSource: true,
        });
    }

    async getAll(userId: string, page: number, limit: number) {
        const data = await this.ordersDao.getAll(userId, page, limit);

        if (data.orders.length === 0)
            throw new ErrorResponse(404, 'Sizda hozirda buyurtma mavjud emas!');

        return data;
    }

    async getAllReady() {
        const data = await this.ordersDao.getAllReady();

        if (data.length === 0) return [];

        return data;
    }

    async getByCity() {
        const data = await this.ordersDao.getByCity();

        return data;
    }

    async getAllReferalOrders(
        userId: string,
        page?: number,
        limit?: number,
        filter?: string
    ) {
        const data = await this.ordersDao.getAllReferalOrders(
            userId,
            page,
            limit,
            filter
        );

        return data;
    }

    async getProductsCategory(id: string) {
        const order = await this.ordersDao.getProductsCategory(id);

        if (!order)
            throw new ErrorResponse(404, 'Bunday buyurtma mavjud emas!');

        return order;
    }

    async deleteProductOrder(id: string, variantId: number) {
        const order = await this.ordersDao.getOrderById(id);
        if (!order)
            throw new ErrorResponse(404, 'Bunday buyurtma mavjud emas!');

        for (let i = 0; i < order.orderItems.length; i++) {
            let newOrderItems = order.orderItems.slice();
            if (order.orderItems[i].variantId == variantId) {
                if (i == 0 && order.orderItems[0].quantity == 1) {
                    break;
                }
                newOrderItems[i].quantity -= 1;
                if (order.orderItems[i].quantity == 1) {
                    newOrderItems.splice(i, 1);
                }
            }
            await this.ordersDao.updateOrder(id, {
                orderItems: newOrderItems,
            });
        }
        return order;
    }

    async getAllOrderStatusAdmin(
        status: string,
        page?: number,
        limit?: number,
        sTime?: Date,
        eTime?: Date,
        region?: string
    ) {
        const orders = await this.ordersDao.getAllOrderStatusAdmin(
            status,
            page,
            limit,
            sTime,
            eTime,
            region
        );

        return orders;
    }
    
    async getAllOrderStatusSeller(
        status: string,
        page?: number,
        limit?: number,
        sTime?: Date,
        eTime?: Date,
        region?: string,
        sellerId?:string
    ) {
        const orders = await this.ordersDao.getAllOrderStatusSeller(
            status,
            page,
            limit,
            sTime,
            eTime,
            region,
            sellerId
        );

        return orders;
    }

    async updateOrderStatusAdmin(
        status: string,
        sTime?: Date,
        eTime?: Date,
        region?: string
    ) {
        const orders = await this.ordersDao.updateOrderStatusAdmin(
            status,
            sTime,
            eTime,
            region
        );

        if (!orders.length)
            throw new ErrorResponse(404, 'Buyurtmalar topilmadi!');

        return orders;
    }

    async getSumOfSoldProducts() {
        const orders = await new Promise(async (resolve, _) => {
            resolve(await this.ordersDao.getSumOfSoldProducts());
        });

        return orders[0] ? orders[0] : { sumOfSoldProducts: 0 };
    }

    async getProfitValue() {
        const data = await this.ordersDao.getProfitValue();

        return data;
    }

    async getTotalProfitValue() {
        const profitValue = await this.getProfitValue();
        const settings = await this.settingService.getSetting();

        return (
            profitValue.profit -
            // settings[0].delivery_price -
            settings[0].ad_price
        );
    }

    async getPaidPayment() {
        const data = await this.paymentService.getPaidPayment();

        return data;
    }

    async getUsersBalance() {
        const { adminBalance, operatorBalance } =
            await this.userService.getAllBalance();

        return {
            adminBalance: adminBalance[0]?.balance
                ? adminBalance[0]?.balance
                : 0,
            operatorBalance: operatorBalance[0]?.balance
                ? operatorBalance[0]?.balance
                : 0,
        };
    }

    async getAllByStatus(status: string, isTaken?: boolean) {
        const orders = await this.ordersDao.getAllByStatus(status, isTaken);
        if (!orders) return [];
        return orders;
    }

    async getWeekOrders(nowDate: Date, lastDate: Date) {
        return await this.ordersDao.getWeekOrders(nowDate, lastDate);
    }

    async getOneOrder(id: string) {
        return await this.ordersDao.getOneOrder(id);
    }

    async getOrderProduct(id: string) {
        return await this.ordersDao.getOrderProduct(id);
    }

    async getOperatorOrderProduct(id: string, status: string) {
        const orders = await this.ordersDao.getOperatorOrderProduct(id, status);
        if (!orders) return [];

        return orders;
    }

    async getOperatorOrderProductCount(id: string) {
        return await this.ordersDao.getOperatorOrderProductCount(id);
    }

    async getOrderWithUser(userId: string) {
        return await this.ordersDao.getOrderWithName(userId);
    }

    async userOrderCount(userId?: string) {
        let orderCount = {
            new: 0,
            ready: 0,
            onway: 0,
            delivered: 0,
            canceled: 0,
            hold: 0,
            archived: 0,
            pending: 0,
        };
        const userOrders = await this.ordersDao.getOrderWithName(userId);

        userOrders.forEach((order) => {
            orderCount[order.status] += 1;
        });

        return orderCount;
    }
    async sellerOrderCount(userId?: string) {
        let orderCount = {
            new: 0,
            ready: 0,
            onway: 0,
            delivered: 0,
            canceled: 0,
            hold: 0,
            archived: 0,
            pending: 0,
        };
        const userOrders = await this.ordersDao.getOrderWithNameSeller(userId);

        userOrders.forEach((order) => {
            orderCount[order.status] += 1;
        });

        return orderCount;
    }

    async operatorOrderCount(userId?: string) {
        let orderCount = {
            new: 0,
            ready: 0,
            onway: 0,
            delivered: 0,
            canceled: 0,
            hold: 0,
            archived: 0,
            pending: 0,
        };
        const operatorOrders = await this.ordersDao.getOpreatorOrders(userId);

        operatorOrders.forEach((order) => {
            orderCount[order.status] += 1;
        });

        return orderCount;
    }

    async operatorStatistics(
        userId: string,
        type: string,
        status: string,
        page: number,
        limit: number
    ) {
        switch (type) {
            case 'order':
                const userOrders = await this.ordersDao.getOperatorOrders(
                    userId,
                    status,
                    page,
                    limit
                );
                return userOrders;
            case 'payment':
                const payment = await this.paymentService.findOne(
                    userId,
                    status
                );

                return {
                    payment,
                };
            case 'info':
                const orderCount = await this.operatorOrderCount(userId);
                const paymentCount = await this.paymentService.paymentCount(
                    userId
                );
                return { orderCount, paymentCount };
        }
    }

    async userStatistics(
        userId: string,
        type: string,
        status: string,
        page: number,
        limit: number
    ) {
        switch (type) {
            case 'order':
                return await this.ordersDao.getUserOrders(
                    userId,
                    status,
                    page,
                    limit
                );
            case 'payment':
                return {
                    payment: await this.paymentService.findOne(userId, status),
                };
            case 'info':
                const orderCount = await this.userOrderCount(userId);
                const paymentCount = await this.paymentService.paymentCount(
                    userId
                );
                return { orderCount, paymentCount };
        }
    }

    async getWithNumber(id: string, number: number) {
        return await this.ordersDao.getWithNumber(id, number);
    }

    async getOneOperatorOrder(operatorId: string, orderId: string) {
        const order = await this.ordersDao.getOneOperatorOrder(
            operatorId,
            orderId
        );
        if (!order) throw new ErrorResponse(404, 'Bunday buyurtma topilmadi!');

        return order;
    }

    async getOneOperatorOrderMobile(operatorId: string, orderId: string) {
        const order = await this.ordersDao.getOneOperatorOrderMobile(
            operatorId,
            orderId
        );

        return order;
    }

    async searchOrderOperator(operatorId: string, filter: string) {
        if (filter)
            return await this.ordersDao.searchOrderOperator(operatorId, filter);
        return [];
    }

    async updateOrder(id: string, values: UpdateOrderAdminDto) {
        const oldOrder = await this.ordersDao.getOneOrder(id);
        if (!oldOrder.streamId) values.message = undefined;
        const uptatedOrder = await this.ordersDao.updateOrder(id, values);
        const smsService = await this.smsService.getSmsService();

        let status: string;
        switch (values.status) {
            case 'new':
                status = 'yangi';
                break;
            case 'ready':
                status = 'tayyor';
                break;
            case 'onway':
                status = `yo'lda`;
                break;
            case 'delivered':
                status = 'yetkazildi';
                break;
            case 'canceled':
                status = 'bekor qilindi';
                break;
            case 'pending':
                status = 'keyin oladi';
                break;
            case 'hold':
                status = 'hold';
                break;
            case 'archived':
                status = 'arxivlandi';
                break;
        }

        // const { subscription } = await subscriptionCheker();

        // if (subscription === 'premium')
        //     oldOrder.orderItems.forEach(async (order) => {
        //         if (values.status !== oldOrder.status) {
        //             if (smsService[values.status])
        //                 await sendSms(
        //                     `VIPCRM.UZ - ${order.variantId.name} nomli buyurtmangiz holati ${status} ga o'zgardi`,
        //                     uptatedOrder.phone
        //                 );
        //         }
        //     });

        if (uptatedOrder?.streamId) {
            const stream = await this.streamService.findById(
                uptatedOrder.streamId
            );

            if (stream) {
                const user = await this.botSettings.getStreamUser(stream.user);

                if (
                    (values.status != 'new' &&
                        user[0] &&
                        !user[0][values.status]) ||
                    !user[0]['new_order']
                )
                    if (oldOrder.status !== values.status)
                        await sendUptatedOrder(
                            user[0].telegramID,
                            uptatedOrder
                        );
            }
        }
        return uptatedOrder;
    }

    async getAllSearchOrder(filter: string) {
        return await this.ordersDao.getAllSearchOrder(filter);
    }

    async getRegionCountOrder(id: number) {
        return await this.ordersDao.getRegionCountOrder(id);
    }

    async updateOrderAdmin(id: string, values: UpdateOrderAdminDto) {
        const errors: string[] = [];
        const session = await mongoose.startSession();
        session.startTransaction();

        const order = await this.ordersDao.getOrderById(id);
        if (!order)
            throw new ErrorResponse(404, 'Bunday buyurtma mavjud emas!');
        if (values.status === 'archived')
            await this.updateOrder(id, { prevStatus: order.status }).catch(
                (err) => console.log(err)
            );

        if (order?.streamId) {
            if (order.status !== values.status) {
                const request = await this.requestService.getByOrderId(id);

                if (request.length) {
                    await this.requestService.findAndUpdate(id, values.note);
                } else {
                    await this.requestService.create(
                        id,
                        values.note
                            ? values.note
                            : `${
                                  STATUS_TEXT[`${values.status}`]
                              }ga o'zgartirildi!`
                    );
                }
            }

            const orderProduct = await this.ordersDao.getOrderProduct(id);
            const user = await this.userService.findOne(
                orderProduct?.streamHolder?._id
            );

            if (user) {
                if (
                    values.status == 'delivered' &&
                    order.status != 'delivered'
                ) {
                    if (user.deposit) {
                        if (
                            user.deposit > 0 &&
                            user.deposit > orderProduct?.referalPrice
                        ) {
                            await this.userService.update(
                                orderProduct?.streamHolder?._id,
                                {
                                    deposit:
                                        user.deposit -
                                        orderProduct?.referalPrice,
                                    soldProCount: user.soldProCount + 1,
                                }
                            );
                        } else if (
                            user.deposit > 0 &&
                            user.deposit < orderProduct?.referalPrice
                        ) {
                            await this.userService.update(
                                orderProduct?.streamHolder?._id,
                                {
                                    balance:
                                        user.balance +
                                        orderProduct?.referalPrice -
                                        user.deposit,
                                    soldProCount: user.soldProCount + 1,
                                    deposit: 0,
                                }
                            );
                        } else if (user.deposit && user.deposit === 0)
                            await this.userService.update(
                                orderProduct?.streamHolder?._id,
                                {
                                    balance:
                                        user.balance +
                                        orderProduct?.referalPrice,
                                    soldProCount: user.soldProCount + 1,
                                }
                            );
                    } else {
                        await this.userService.update(
                            orderProduct?.streamHolder?._id,
                            {
                                balance:
                                    user.balance + orderProduct?.referalPrice,
                                soldProCount: user.soldProCount + 1,
                            }
                        );
                    }
                }

                if (
                    values.status != 'delivered' &&
                    order.status == 'delivered'
                ) {
                    await this.userService.update(
                        orderProduct?.streamHolder?._id,
                        {
                            balance: user.balance - orderProduct?.referalPrice,
                            soldProCount: user.soldProCount - 1,
                        }
                    );
                }
            }
        }

        if (order.isTaken) {
            const setting = await this.settingService.getSetting();
            let paymentOperator: number = 3000;
            // if (setting.length == 0) {
            //     paymentOperator = 6000;
            // } else {
            //     paymentOperator = setting[0].paymentOperator;
            // }

            const operator = await this.userService.findOne(order.takenById);
            if (values.status == 'delivered' && order.status != 'delivered') {
                await this.userService.update(operator._id, {
                    balance: operator.balance + paymentOperator,
                });
            }
            if (values.status != 'delivered' && order.status == 'delivered') {
                await this.userService.update(operator._id, {
                    balance: operator.balance - paymentOperator,
                });
            }
        }

        if (values.status == 'delivered' && order.status != 'delivered') {
            order.orderItems.forEach(async (pr) => {
                const variant = await this.variantService.findOne(pr.variantId);

                if (variant.availableAmount >= pr.quantity) {
                    await this.variantService.update(variant.uid, {
                        availableAmount: variant.availableAmount - pr.quantity,
                        quantitySold: variant.quantitySold + pr.quantity,
                    });
                } else {
                    errors.push('omborda yetarli emas');
                }
            });
        }

        if (errors.length) {
            await session.abortTransaction();
            return session.endSession();
        }

        if (order.status == 'delivered' && values.status != 'delivered') {
            order.orderItems.forEach(async (pr) => {
                const variant = await this.variantService.findOne(pr.variantId);

                await this.variantService.update(variant.uid, {
                    availableAmount: variant.availableAmount + pr.quantity,
                    quantitySold: variant.quantitySold - pr.quantity,
                });
            });
        }

        await this.updateOrder(id, values).catch((err) => console.log(err));

        await session.commitTransaction();
        session.endSession();

        return { message: 'Buyurtma muvaffaqqiyatli tahrirlandi!' };
    }

    async updateOrderOperator(operatorId: string, id: string, values: IOrder) {
        const order = await this.getOneOperatorOrder(operatorId, id);
        if (order.status == 'delivered' && values.status !== 'delivered')
            throw new ErrorResponse(500, 'Sizda bunday huquq mavjud emas');
        if (order?.streamId && !values?.message)
            throw new ErrorResponse(400, 'Xabar kiritishni unutdingiz');

        if (order.streamId && order.status !== values.status) {
            const request = await this.requestService.getByOrderId(id);

            if (request.length) {
                await this.requestService.findAndUpdate(id, values.message);
            } else {
                await this.requestService.create(
                    id,
                    values.message
                        ? values.message
                        : `${STATUS_TEXT[`${values.status}`]}ga o'zgartirildi!`
                );
            }
        }
        if (order.status !== values.status && order.status != 'new') {
            await this.updateOrder(id, { prevStatus: order.status }).catch(
                (err) => console.log(err)
            );
        }

        values = await new Promise(async (resolve, reject) => {
            for await (const item of values.orderItems) {
                if (!item?.price) {
                    const product = await this.variantService.findOne(
                        item.variantId
                    );

                    item.price = product?.purchasePrice;
                }
            }

            resolve(values);
        });

        return await this.updateOrder(id, values).catch((err) =>
            console.log(err)
        );
    }

    async updateOrderStatusOperator(
        operatorId: string,
        id: string,
        values: UpdateOrderStatusOperatorDto
    ) {
        const order = await this.getOneOperatorOrder(operatorId, id);

        if (order.streamId && order.status !== values.status) {
            await this.requestService.getByOrderId(id);
        }
        if (order.status !== values.status && order.status != 'new') {
            await this.updateOrder(id, { prevStatus: order.status }).catch(
                (err) => console.log(err)
            );
        }

        return await this.updateOrder(id, values).catch((err) =>
            console.log(err)
        );
    }

    async findByStreamId(streamId: string, page: number, limit: number) {
        return await this.ordersDao.findByStreamId(streamId, page, limit);
    }

    async findByStreamOrders(
        userId: string,
        status: string,
        page: number,
        limit: number,
        filter?: string
    ) {
        return await this.ordersDao.findByStreamOrders(
            userId,
            status,
            page,
            limit,
            filter
        );
    }

    async getOrderSlice(nowDate: Date, lastDate: Date, userId?: string) {
        return await this.ordersDao.getOrderSlice(nowDate, lastDate, userId);
    }

    async getProductsDelivered() {
        return await this.ordersDao.getProductsDelivered();
    }

    async getUsersForCompetition(s: Date, e: Date) {
        return await this.ordersDao.getUsersForCompetition(s, e);
    }

    async getOrdersIdWithStatus(status: string) {
        return await this.ordersDao.getOrdersIdWithStatus(status);
    }

    async getBestSellers() {
        return await this.ordersDao.getBestSellers();
    }

    async operatorNewOrdersLastFiveMinutes(id: string) {
        return await this.ordersDao.operatorNewOrdersLastFiveMinutes(id);
    }

    async resetOperatorOrders(id: string) {
        const orders = await this.getOperatorOrderProduct(id, 'new');

        await new Promise(async (resolve, reject) => {
            for await (let order of orders) {
                await this.updateOrder(order._id, {
                    isTaken: false,
                    takenById: null,
                });
            }
            resolve('success');
        });
    }
}
