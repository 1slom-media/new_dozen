import { NextFunction, Request, Response } from 'express';
import { BrandsService } from './brands.service';
import { BrandsDto } from './dto/brands.dto';
import { ISearchQuery } from '../shared/interface/query.interface';
import extractQuery from '../shared/utils/extractQuery';

export class BrandsController {
    private service = new BrandsService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { title }: BrandsDto = req.body;

            const data = await this.service.create(title);

            res.status(201).json(data);
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
            const { number } = req.params;
            const { title }: BrandsDto = req.body;

            const data = await this.service.update(+number, title);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public findOne = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;

            const data = await this.service.findOne(+number);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public findAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.service.findAll(page, limit, filter);

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
        const { number } = req.params;

        await this.service.delete(+number);

        res.status(200).json({ message: `Muvaffaqiyatli o'chirildi` });
    };
}
