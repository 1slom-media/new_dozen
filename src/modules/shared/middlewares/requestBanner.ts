import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';
const geoip = require('geoip-lite');

export const requestBanner = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ip =
            req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(ip);

        if (ip) {
            const geo = geoip.lookup(ip);

            if (
                (geo && geo?.country === 'UZ') ||
                geo?.country === 'RU' ||
                ip == '::1'
            ) {
                next();
            } else {
                throw new ErrorResponse(
                    400,
                    `Siz turgan davlatdan buyurtma qabul qilinmaydi. Agar VPN dan foydalansangiz, iltimos o'chirib qaytadan urinib ko'ring!`
                );
            }
        } else {
            throw new ErrorResponse(400, 'Invalid request.');
        }
    } catch (error) {
        next(error);
    }
};
