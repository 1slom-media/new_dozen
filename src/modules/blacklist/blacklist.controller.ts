import { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../shared/utils/uploadFile';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';
import BlackListService from './blacklist.service';
import { CreateBlackListDto } from './dto/blacklist.dto';
import { UpdateBlackListDto } from './dto/blacklist.dto';

export default class BlackListController {
    private blackListService = new BlackListService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const values: CreateBlackListDto = req.body;

            const data = await this.blackListService.create(values);

            res.status(201).json({
                success: true,
                data,
                message: `Qora ro'yxatga muvafaqqiyatli qo'shildi`,
            });
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
            const { id } = req.params;
            const { isBlock }: UpdateBlackListDto = req.body;

            const data = await this.blackListService.update(id, isBlock);

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };

    public delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const data = await this.blackListService.delete(id);

            res.status(201).json({ message: `Qora ro'yxatdan olib tashlandi` });
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
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;

            const data = await this.blackListService.getAll(
                filter,
                page,
                limit
            );

            res.status(201).json(data);
        } catch (error) {
            next(error);
        }
    };
}
