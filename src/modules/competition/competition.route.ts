import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import CompetitionController from './competition.controller';
import {
    CreateCompetitionDto,
    UpdateCompetitionDto,
} from './dto/competition.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import imageValidationMiddleware from '../shared/middlewares/validateImages';

export default class CompetitionRoute implements Routes {
    public path = '/konkurs';
    public router = Router();
    public competitionController = new CompetitionController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, this.competitionController.getAll);
        this.router.get(
            `${this.path}/:id`,
            validate(ValidateParamsDTO, 'params'),
            this.competitionController.findOne
        );
        this.router.post(
            `${this.path}/`,
            protect,
            isAdmin,
            imageValidationMiddleware('banner'),
            validate(CreateCompetitionDto, 'body', true),
            this.competitionController.create
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            isAdmin,
            imageValidationMiddleware('banner'),
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateCompetitionDto, 'body', true),
            this.competitionController.update
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            this.competitionController.delete
        );
    }
}
