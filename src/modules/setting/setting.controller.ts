import { NextFunction, Request, Response } from 'express';
import SettingService from './setting.service';
import { CreateSettingDto } from './dto/setting.dto';
import { uploadFile } from '../shared/utils/uploadFile';

export default class SettingController {
    private settingService = new SettingService();

    public settingAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const settingData: CreateSettingDto = req.body;
            if (req['files']) {
                const image = await uploadFile(req['files']['logo']);

                settingData.logo = image[0];
            }
            const data = await this.settingService.create(settingData);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getSetting = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.settingService.getSetting();

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
