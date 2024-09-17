import { NextFunction, Request, Response } from 'express';
import { CardService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/cards.dto';

export class CardController {
    private cardService = new CardService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const values: CreateCardDto = req.body;

            await this.cardService.create({
                ...values,
                userId: req.body.user_id,
            });

            res.status(201).json({
                message: 'Karta muvaffaqqiyatli yaratildi',
            });
        } catch (err) {
            next(err);
        }
    };

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.cardService.getAll(req.body.user_id);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getOne = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const data = await this.cardService.getOne(req.body.user_id, id);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const values: UpdateCardDto = req.body;
            const data = await this.cardService.update(
                req.body.user_id,
                id,
                values
            );

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const data = await this.cardService.delete(req.body.user_id, id);

            res.status(200).json({
                message: "Karta muvaffaqqiyatli o'chirildi",
            });
        } catch (err) {
            next(err);
        }
    };
}
