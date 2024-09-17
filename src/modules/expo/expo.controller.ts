import { NextFunction, Request, Response } from 'express';
import ExpoService from './expo.service';
import CreateExpoToken from './dto/expo.dto';

export default class ExpoController {
    private expoService = new ExpoService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { user_id } = req.body;

            const { token }: CreateExpoToken = req.body;

            const data = await this.expoService.create({
                token,
                userId: user_id,
            });

            res.status(201).json({
                success: true,
                data,
                message: `Expo token muvafaqqiyatli yozildi`,
            });
        } catch (error) {
            next(error);
        }
    };
}
