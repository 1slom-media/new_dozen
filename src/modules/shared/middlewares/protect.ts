import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { server } from '../../../config/conf';
import ErrorResponse from '../utils/errorResponse';
import { IDecodedToken } from 'modules/auth/interface/auth.interface';
import { RequestWithUser } from '../interface/routes.interface';
import UserDao from '../../user/dao/user.dao';

const accessToken = server.accessToken;
const usersDao = new UserDao();

export const protect = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const authToken = req.headers.auth;

        if (!authToken)
            throw new ErrorResponse(
                401,
                `Ruxsatingiz yo'q iltimos login qiling`
            );

        var decodedToken: IDecodedToken;
        verify(
            String(authToken),
            accessToken.secret,
            (err, decode: IDecodedToken): void => {
                if (err) throw new ErrorResponse(401, 'Token yaroqsiz!');
                decodedToken = decode;
            }
        );

        if (!decodedToken || decodedToken.token_type !== 'access')
            throw new ErrorResponse(401, 'Ruxsat berilmagan!');

        const user = await usersDao.findOne(decodedToken.user_id);
        
        if (!user) throw new ErrorResponse(401, 'Foydalanuvchi mavjud emas');

        req.body.user_id = user._id;  

        next();
    } catch (error) {
        next(error);
    }
};

export const isAdmin = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await usersDao.findOne(req.body.user_id);
        if (!user.isAdmin)
            throw new ErrorResponse(401, 'Foydalanuvchi bosh admin emas!');

        next();
    } catch (error) {
        next(error);
    }
};

export const isOperator = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await usersDao.findOne(req.body.user_id);
        if (!user) throw new ErrorResponse(404, 'Bunday operator mavjud emas!');

        if (!user.isOperator)
            throw new ErrorResponse(
                401,
                `Siz operator sifatida ro'yhatdan o'tmagansiz!`
            );

        if (user.status === 0)
            throw new ErrorResponse(
                400,
                `Siz bloklangansiz admin bilan bog'laning!`
            );
        next();
    } catch (error) {
        next(error);
    }
};
