import { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../shared/utils/uploadFile';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';
import BotSettingsService from './botSettings.service';
import { UpdateBotSettingsDto, SendMessage } from './dto/botSettings.dto';

export default class BotSettingsController {
    private botSettingsService = new BotSettingsService();

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.body.user_id;
            const values: UpdateBotSettingsDto = req.body;

            const data = await this.botSettingsService.update(id, values);

            res.status(201).json({
                success: true,
                data,
                message: `Bot xabarnomalari muvafaqqiyatli tahrirlandi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public sendMessage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { message }: SendMessage = req.body;

            const data = await this.botSettingsService.sendMessage(message);

            res.status(201).json({
                success: true,
                data,
                message: `Xabarlar muvaffaqiyatli yetkazildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public getSettings = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const id = req.body.user_id;

            const data = await this.botSettingsService.getOne(id);

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };
}
