import { NextFunction, Request, Response } from 'express';
import SubFeaturesService from './subfeatures.service';
import {
    CreateSubFeatureDto,
    UpdateSubFeatureDto,
} from './dto/subfeatures.dto';

export default class SubFeaturesController {
    private subFeaturesService = new SubFeaturesService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const values: CreateSubFeatureDto = req.body;

            const data = await this.subFeaturesService.create(values);
            res.status(201).json(data);
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
            const values: UpdateSubFeatureDto = req.body;

            const data = await this.subFeaturesService.update(
                req.params.id,
                values
            );

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public findByFeature = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.subFeaturesService.findByFeature(
                Number(req.params.number)
            );

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
            await this.subFeaturesService.delete(req.params.id);

            res.status(200).json({
                message: 'Subfeature deleted successfully',
            });
        } catch (err) {
            next(err);
        }
    };
}
