import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';

const videoValidationMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req['files'] && req['files']?.video) {
                if (req['files']?.video.size / 1048576 > 10)
                    throw new ErrorResponse(
                        500,
                        'The size of the video should not be larger than 10mb'
                    );
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default videoValidationMiddleware;
