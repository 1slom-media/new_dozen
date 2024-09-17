import SmsServiceService from '../smsSettings/sms.service';
import ErrorResponse from '../shared/utils/errorResponse';
import UserService from '../user/user.service';
import PaymentDao from './dao/payment.dao';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { sendSms } from '../shared/utils/sendSms';
// import { subscriptionCheker } from '../shared/utils/checkSubscription';

export default class PaymentService {
    private paymentDao = new PaymentDao();
    private userService = new UserService();
    private smsService = new SmsServiceService();

    async createPayment(userId: string, values: CreatePaymentDto) {
        const payments = await this.paymentDao.findOne(userId);
        const user = await this.userService.findOne(userId);
        if (user.balance < values.amount)
            throw new ErrorResponse(400, "Sizda yetarli pul mablag'i yo'q!");

        const settings = await this.smsService.getSmsService();
        const admins = await this.userService.getAllAdmins();
        if (settings['new_payment']) {
            admins.forEach(async (admin) => {
                await sendSms(
                    `VIPCRM.UZ - To'lov uchun ${values.amount.toLocaleString(
                        'fr-FR'
                    )} so'mlik so'rov qoldirildi!`,
                    admin.phone
                );
            });
        }

        if (payments.length === 0) {
            await this.userService.update(userId, {
                balance: user.balance - values.amount,
            });
            const request = await this.paymentDao.create({
                ...values,
                user: userId,
            });
            return { message: "So'rov yuborildi!", request };
        } else {
            const lastPayStatus = payments[payments.length - 1].status;
            if (lastPayStatus === 'accepted' || lastPayStatus === 'waiting')
                throw new ErrorResponse(
                    400,
                    "Sizning oxirgi so'rovingiz tasdiqlanmagan"
                );
            await this.userService.update(userId, {
                balance: user.balance - values.amount,
            });
            const request = await this.paymentDao.create({
                ...values,
                user: userId,
            });
            return { message: "So'rov yuborildi!", request };
        }
    }

    async getAll(
        userId: string,
        page?: number,
        limit?: number,
        select?: string
    ) {
        const data = await this.paymentDao.getAll(userId, page, limit, select);
        return data;
    }

    async update(id: string, values: UpdatePaymentDto) {
        var savedUser: any;
        var updatedPayment: any;
        const payment = await this.paymentDao.findById(id);
        const user = await this.userService.findOne(payment.user);
        if (!payment)
            throw new ErrorResponse(404, "Bunday to'lov so'rovi mavjud emas!");

        // const smsService = await this.smsService.getSmsService();
        // const { subscription } = await subscriptionCheker();

        // if (subscription == 'premium') {
        //     if (smsService[values.status])
        //         sendSms(
        //             `To'lov uchun so'rovingiz holati ${values.status} ga o'zgardi`,
        //             user.phone
        //         );
        // }
        switch (values.status) {
            case 'fulfilled':
                if (payment.status === 'fulfilled')
                    throw new ErrorResponse(201, "To'lov bajarilgan !!!");
                if (
                    payment.status !== 'waiting' &&
                    payment.status !== 'accepted'
                ) {
                    savedUser = await this.userService.update(user._id, {
                        paid: user.paid + payment.amount,
                        balance: user.balance - payment.amount,
                    });
                } else {
                    savedUser = await this.userService.update(user._id, {
                        paid: user.paid + payment.amount,
                    });
                }
                updatedPayment = await this.paymentDao.update(id, values);
                return {
                    user: savedUser,
                    payment: updatedPayment,
                };
            case 'waiting':
                updatedPayment = await this.paymentDao.update(id, values);
                savedUser = user;
                if (payment.status === 'fulfilled')
                    savedUser = await this.userService.update(user._id, {
                        paid: user.paid - payment.amount,
                    });
                if (payment.status === 'rejected')
                    savedUser = await this.userService.update(user._id, {
                        balance: user.balance - payment.amount,
                    });
                return { user: savedUser, payment: updatedPayment };
            case 'rejected':
                if (payment.status === values.status)
                    throw new ErrorResponse(500, 'Avvaldan rad etilgan!');

                if (payment.status === 'fulfilled')
                    await this.userService.update(user._id, {
                        paid: user.paid - payment.amount,
                    });
                savedUser = await this.userService.update(user._id, {
                    balance: user.balance + payment.amount,
                });
                updatedPayment = await this.paymentDao.update(id, values);
                return { user: savedUser, payment: updatedPayment };
        }
    }

    async getAllAdmin(
        page?: number,
        limit?: number,
        from?: number,
        to?: number,
        status?: string,
        filter?: string
    ) {
        const data = await this.paymentDao.getAllAdmin(
            page,
            limit,
            from,
            to,
            status,
            filter
        );
        return data;
    }

    async getPaidPayment() {
        const data = await this.paymentDao.getPaidPayment();
        return data;
    }

    async getOperatorPaymentCount(userId: string) {
        let operatorPaymentCount = {
            accepted: 0,
            waiting: 0,
            fulfilled: 0,
            rejected: 0,
        };
        const user = this.userService.findOne(
            userId,
            ' -createdAt -updatedAt -__v -isAdmin -isOperator -soldProCount'
        );

        const payments = await this.paymentDao.findOne(userId);
        payments.forEach((item) => {
            operatorPaymentCount[item.status] += 1;
        });

        return { operatorPaymentCount, user };
    }
    async findOne(userId: string, status?: string) {
        return await this.paymentDao.findOne(userId, status);
    }

    async paymentCount(userId: string) {
        let paymentCount = {
            accepted: 0,
            waiting: 0,
            fulfilled: 0,
            rejected: 0,
        };

        const payments = await this.paymentDao.findOne(userId);
        payments.forEach((item) => {
            paymentCount[item.status] += 1;
        });

        return paymentCount;
    }
}
