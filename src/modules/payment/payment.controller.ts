import { NextFunction, Request, Response } from 'express';
import PaymentService from './payment.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { STATUS_TEXT } from '../../config/consts';
import extractQuery from '../shared/utils/extractQuery';
import BotSettingsService from '../botSettings/botSettings.service';
import { sendUptatedPayment } from '../shared/utils/sendMessage';
import { ISearchQuery } from '../shared/interface/query.interface';

export default class PaymentController {
    private paymentService = new PaymentService();
    private botSettings = new BotSettingsService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { amount, card }: CreatePaymentDto = req.body;
            const { message, request } =
                await this.paymentService.createPayment(req.body.user_id, {
                    amount,
                    card,
                });

            res.status(200).json({
                message,
                request,
            });
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
            const data = await this.paymentService.getAll(
                req.body.user_id,
                page,
                limit,
                '-user -updatedAt -__v'
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page, from, to, status } = extractQuery(query).sorts;
            const data = await this.paymentService.getAllAdmin(
                page,
                limit,
                Number(from),
                Number(to),
                status,
                filter
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { status, message }: UpdatePaymentDto = req.body;
            const data = await this.paymentService.update(req.params.id, {
                status,
                message:
                    message == null
                        ? `${STATUS_TEXT[`${status}`]}ga o'zgartirildi!`
                        : message,
            });
            const user = await this.botSettings.getStreamUser(data.user._id);
            if (!user[0]['payment'])
                await sendUptatedPayment(user[0].telegramID, data.payment);
            res.status(200).json({
                message: data,
            });
        } catch (error) {
            next(error);
        }
    };
}
