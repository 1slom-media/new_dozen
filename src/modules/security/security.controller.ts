import { Request, Response, NextFunction } from 'express';
import SecurityService from './security.service';
import extractQuery from '../shared/utils/extractQuery';

export default class SecurityController {
    private securityService = new SecurityService();

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { limit, page } = extractQuery(query).sorts;

            const data = await this.securityService.getAll(page, limit);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
