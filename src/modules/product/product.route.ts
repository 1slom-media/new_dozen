import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import {
    ValidateParamsDTO,
    ValidateParamsNumberDTO,
} from '../shared/dto/params.dto';
import ProductController from './product.controller';
import {
    CreateProductDto,
    UpdateProductDto,
    UpdateSkuDto,
} from './dto/product.dto';
import { isAdmin, protect } from '../shared/middlewares/protect';
import imageValidationMiddleware from '../shared/middlewares/validateImages';
import videoValidationMiddleware from '../shared/middlewares/videoValidator';

export default class ProductRoute implements Routes {
    public path = '/product';
    public router = Router();
    public productController = new ProductController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/`, this.productController.getAll); //tugadi
        this.router.get(
            `${this.path}/cheap-products`,
            this.productController.getCheapProductsBySettingsValue // tugadi
        );
        this.router.get(
            `${this.path}/market`,
            this.productController.getAllForMarket //tugadi
        );
        this.router.get(
            `${this.path}/all`,
            this.productController.getAllProducts //tugadi
        );
        // this.router.get(
        //     `${this.path}/bestselling`,
        //     this.productController.getBestSellingProducts      product schemani oziga boglab qaytadan qilish kerak
        // );
        this.router.get(
            `/seo/productids`,
            this.productController.getProductIds //tugadi
        );
        this.router.get(
            `${this.path}/newest`,
            this.productController.getNewestProducts //tugadi
        );
        this.router.get(
            `${this.path}/best-selled`,
            this.productController.getBestSelledProducts //tugadi
        );
        this.router.get(
            `${this.path}/get-with-variants`,
            this.productController.getForUpdateOrder //tugadi
        );
        this.router.get(
            `${this.path}/admin/all`,
            protect,
            isAdmin,
            this.productController.getAllProductsAdmin //tugadi
        );
        this.router.get(
            `${this.path}/seller/all`,
            protect,
            this.productController.getAllProductsSeller //tugadi
        );
        this.router.get(
            `${this.path}/delivered`,
            this.productController.getProductsDelivered // orders schemaga bogliq tugamagan hali
        );
        this.router.get(
            `${this.path}/:number`,
            validate(ValidateParamsNumberDTO, 'params'), // tugadi
            this.productController.findOne
        );
        this.router.get(
            `${this.path}/skus/:number`,
            protect,
            validate(ValidateParamsNumberDTO, 'params'), // tugagan
            this.productController.getForupdateSku
        );
        this.router.put(
            `${this.path}/skus`,
            protect,
            validate(UpdateSkuDto, 'body', true), // tugagan
            this.productController.updateSkus
        );
        this.router.get(
            `${this.path}/filter/:number`,
            validate(ValidateParamsNumberDTO, 'params'), //tugagan
            this.productController.getFilterOptions
        );
        this.router.post(
            `${this.path}/`,
            protect,
            validate(CreateProductDto, 'body', true), // tugagan
            this.productController.create
        );
        this.router.put(
            `${this.path}/:number`,
            protect,
            validate(ValidateParamsNumberDTO, 'params'), // tugagan
            validate(UpdateProductDto, 'body', true),
            this.productController.update
        );
        this.router.delete(
            `${this.path}/:number`,
            protect,
            validate(ValidateParamsNumberDTO, 'params'), //tugagan
            this.productController.delete
        );
        this.router.post(
            `/fileupload`,
            protect,
            imageValidationMiddleware('images'), //tugagan
            videoValidationMiddleware(),
            this.productController.uploadFile
        );
    }
}
