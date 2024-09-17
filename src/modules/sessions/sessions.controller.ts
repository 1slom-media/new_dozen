import { NextFunction, Request, Response } from 'express';
import SessionsService from './sessions.service';

export default class SessionsController {
    private sessionsService = new SessionsService();

    public getSessions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.sessionsService.getSessions(
                req.body.user_id
            );

            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    };
}
