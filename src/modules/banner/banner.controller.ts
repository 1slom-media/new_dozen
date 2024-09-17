import { NextFunction, Request, Response } from 'express';
import { BannersService } from './banner.service';
import { uploadFile } from '../shared/utils/uploadFile';
import { CreateBanner, UpdateBanner } from './dto/banner.dto';

export class BannersController {
    private bannersServcie = new BannersService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const values: CreateBanner = req.body;
            const images = await uploadFile(req['files']['image']);
            values.image = images[0];

            const data = await this.bannersServcie.create({
                image: values.image,
                productId: +values.productId,
                active: values.active,
            });

            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.bannersServcie.getAll();

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getAllForAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.bannersServcie.getAllForAdmin();

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            await this.bannersServcie.delete(id);

            res.status(200).json({ message: 'Muvaffaqiyatli ochirildi' });
        } catch (err) {
            next(err);
        }
    };

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { active }: UpdateBanner = req.body;

            const data = await this.bannersServcie.update(id, active);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
