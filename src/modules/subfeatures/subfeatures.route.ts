import { Router } from 'express';
import validate from '../shared/middlewares/validate';
import { Routes } from '../shared/interface/routes.interface';
import { isAdmin, protect } from '../shared/middlewares/protect';
import {
    ValidateParamsNumberDTO,
    ValidateParamsDTO,
} from '../shared/dto/params.dto';
import SubFeaturesController from './subfeatures.controller';
import {
    CreateSubFeatureDto,
    UpdateSubFeatureDto,
} from './dto/subfeatures.dto';

export default class SubFeaturesRoute implements Routes {
    public path = '/subfeatures';
    public router = Router();
    public subFeaturesController = new SubFeaturesController();

    constructor() {
        this.initializeRoutes();
    }
    public initializeRoutes() {
        this.router.post(
            this.path,
            protect,
            isAdmin,
            validate(CreateSubFeatureDto, 'body', true),
            this.subFeaturesController.create
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            isAdmin,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateSubFeatureDto, 'body', true),
            this.subFeaturesController.update
        );
        this.router.get(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.subFeaturesController.findByFeature
        );
        this.router.delete(
            `${this.path}/:id`,
            validate(ValidateParamsDTO, 'params'),
            this.subFeaturesController.delete
        );
    }
}
