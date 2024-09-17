import { Request, Response, NextFunction } from 'express';
import { InvoicesService } from './invoices.service';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';

export class InvoicesController {
    private invoicesService = new InvoicesService();

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page, startTime, endTime, status, region } =
                extractQuery(query).sorts;

            const data = await this.invoicesService.getAll(
                status,
                limit,
                page,
                filter,
                startTime,
                endTime,
                region
            );

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
