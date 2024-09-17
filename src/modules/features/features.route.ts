import { Router } from 'express';
import FeaturesController from './features.controller';
import validate from '../shared/middlewares/validate';
import { Routes } from '../shared/interface/routes.interface';
import { isAdmin, protect } from '../shared/middlewares/protect';
import { CreateFeatureDto } from './dto/features.dto';
import { ValidateParamsNumberDTO } from '../shared/dto/params.dto';

export default class FeaturesRoute implements Routes {
    public path = '/features';
    public router = Router();
    public featuresController = new FeaturesController();

    constructor() {
        this.initializeRoutes();
    }
    public initializeRoutes() {
        this.router.post(
            this.path,
            protect,
            isAdmin,
            validate(CreateFeatureDto, 'body', true),
            this.featuresController.create
        );
        this.router.get(this.path, this.featuresController.findAll);
        this.router.get(
            `${this.path}/all`,
            this.featuresController.findAllWithSubfeatures
        );
        this.router.put(
            `${this.path}/:number`,
            protect,
            isAdmin,
            validate(ValidateParamsNumberDTO, 'params'),
            validate(CreateFeatureDto, 'body', true),
            this.featuresController.update
        );
        this.router.get(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.featuresController.findOne
        );
        this.router.delete(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'),
            this.featuresController.delete
        );
    }
}
