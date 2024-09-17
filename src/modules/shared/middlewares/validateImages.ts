import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';

const fileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const imageValidationMiddleware = (files: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req['files'] && req['files'][files]) {
                if (Array.isArray(req['files'][files])) {
                    for (const file of req['files'][files]) {
                        if (!fileTypes.includes(file.mimetype))
                            throw new ErrorResponse(
                                500,
                                'Image formats supported: JPG, PNG, JPEG, WEBP'
                            );
                    }
                } else {
                    if (!fileTypes.includes(req['files'][files]['mimetype']))
                        throw new ErrorResponse(
                            500,
                            'Image formats supported: JPG, PNG, JPEG, WEBP'
                        );
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default imageValidationMiddleware;
