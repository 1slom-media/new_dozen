import { Request, Response, NextFunction } from 'express';
import RequestService from './request.service';
import extractQuery from '../shared/utils/extractQuery';

export default class RequsetController {
    private requestService = new RequestService();

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { page, status, from, to } = extractQuery(query).sorts;

            const data = await this.requestService.getAll(
                req.body.user_id,
                page,
                status,
                from,
                to
            );

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
