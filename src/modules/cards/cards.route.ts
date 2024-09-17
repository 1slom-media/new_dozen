import { Router } from 'express';
import { CreateCardDto, UpdateCardDto } from './dto/cards.dto';
import { CardController } from './cards.controller';
import validate from '../shared/middlewares/validate';
import { protect } from '../shared/middlewares/protect';
import { ValidateParamsDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';

export default class CardRoute implements Routes {
    public path = '/cards';
    public router = Router();
    public controller = new CardController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, protect, this.controller.getAll);
        this.router.get(
            `${this.path}/:id`,
            protect,
            validate(ValidateParamsDTO, 'params'),
            this.controller.getOne
        );
        this.router.post(
            `${this.path}/`,
            protect,
            validate(CreateCardDto, 'body', true),
            this.controller.create
        );
        this.router.put(
            `${this.path}/:id`,
            protect,
            validate(ValidateParamsDTO, 'params'),
            validate(UpdateCardDto, 'body', true),
            this.controller.update
        );
        this.router.delete(
            `${this.path}/:id`,
            protect,
            validate(ValidateParamsDTO, 'params'),
            this.controller.delete
        );
    }
}
