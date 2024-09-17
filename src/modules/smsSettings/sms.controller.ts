import { NextFunction, Request, Response } from 'express';
import SmsServiceService from './sms.service';
import { UpdateSmsServiceDto } from './dto/sms.dto';

export default class SmsServiceController {
    private smsService = new SmsServiceService();

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                archived,
                canceled,
                delivered,
                hold,
                onway,
                pending,
                ready,
                fulfilled,
                rejected,
                new_payment,
            }: UpdateSmsServiceDto = req.body;

            const data = await this.smsService.update({
                archived,
                canceled,
                delivered,
                hold,
                onway,
                pending,
                ready,
                fulfilled,
                rejected,
                new_payment,
            });

            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getSmsService = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.smsService.getSmsService();

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
