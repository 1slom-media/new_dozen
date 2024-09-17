import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';
import SecurityService from '../../security/security.service';

const securityService = new SecurityService();

export const requestChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ipAddress = req.ip;

        const device = req?.useragent?.platform ?? 'Unknown';
        const browser = req?.useragent?.browser ?? 'Unknown';

        const status = await securityService.getStatus(ipAddress.toString());

        if (!status)
            throw new ErrorResponse(
                400,
                `Xatolik yuz berdi, 24 soat ichidagi buyurtmalar soni cheklangan`
            );
        req.body.user_ip = ipAddress.toString();
        req.body.user_device = device;
        req.body.user_browser = browser;
        next();
    } catch (error) {
        next(error);
    }
};
