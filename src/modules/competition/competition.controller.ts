import { NextFunction, Request, Response } from 'express';
import CompetitionService from './competition.service';
import {
    CreateCompetitionDto,
    UpdateCompetitionDto,
} from './dto/competition.dto';
import { uploadFile } from '../shared/utils/uploadFile';

export default class CompetitionController {
    private competitionService = new CompetitionService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const competitionData: CreateCompetitionDto = req.body;
            const images = await uploadFile(req['files']['banner']);
            competitionData.banner = images[0];

            const data = await this.competitionService.create(competitionData);

            res.status(201).json({
                success: true,
                data,
                message: `Konkurs muvafaqqiyatli yaratildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.competitionService.getAll();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public findOne = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            const data = await this.competitionService.findOne(id);

            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    public update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const competitionData: UpdateCompetitionDto = req.body;

            if (req['files']) {
                const images = await uploadFile(req['files']['banner']);
                competitionData.banner = images[0];
            }

            const data = await this.competitionService.update(
                id,
                competitionData
            );

            res.status(200).json({
                success: true,
                data,
                message: `Konkurs muvafaqqiyatli tahrirlandi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { id } = req.params;

            await this.competitionService.delete(id);

            res.status(200).json({
                success: true,
                message: `Konkurs muvafaqqiyatli o'chirildi`,
            });
        } catch (error) {
            next(error);
        }
    };
}
