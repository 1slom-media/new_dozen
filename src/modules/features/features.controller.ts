import { NextFunction, Request, Response } from 'express';
import FeaturesService from './features.service';
import { CreateFeatureDto } from './dto/features.dto';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';

export default class FeaturesController {
    private featuresService = new FeaturesService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const values: CreateFeatureDto = req.body;
            const data = await this.featuresService.create(values);

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
            const values: CreateFeatureDto = req.body;
            const data = await this.featuresService.update(
                Number(req.params.number),
                values
            );

            res.status(201).json(data);
        } catch (err) {
            next(err);
        }
    };

    public findAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.featuresService.findAll(
                limit,
                page,
                filter
            );
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public findAllWithSubfeatures = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.featuresService.findAllWithSubfeatures(
                limit,
                page,
                filter
            );
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public findOne = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.featuresService.findOne(
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
            await this.featuresService.delete(Number(req.params.number));
            res.status(200).json({ message: 'Feature deleted successfully' });
        } catch (err) {
            next(err);
        }
    };
}
