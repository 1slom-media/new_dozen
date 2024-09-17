import { NextFunction, Request, Response } from 'express';
import ProductService from './product.service';
import {
    CreateProductDto,
    UpdateProductDto,
    UpdateSkuDto,
} from './dto/product.dto';
import { uploadFile } from '../shared/utils/uploadFile';
import { ISearchQuery } from '../shared/interface/query.interface';
import extractQuery from '../shared/utils/extractQuery';
import OrderService from '../order/order.service';
import { BrandsService } from '../brands/brands.service';
import SubFeaturesService from '../subfeatures/subfeatures.service';
import { imageUploader, videoUploader } from '../shared/utils/imageUploader';

export default class ProductController {
    private productService = new ProductService();
    private orderService = new OrderService();
    private brandService = new BrandsService();
    private subFeaturesService = new SubFeaturesService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const productData: CreateProductDto = req.body;

            const data = await this.productService.create(productData);

            res.status(201).json({
                success: true,
                data,
                message: `Maxsulot muvafaqqiyatli yaratildi`,
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
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page, color, minPrice, maxPrice } =
                extractQuery(query).sorts;

            const data = await this.productService.getAll(filter, page, limit);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getProductsDelivered = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.orderService.getProductsDelivered();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllForMarket = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page, category } = extractQuery(query).sorts;

            const data = await this.productService.getAllForMarket(
                filter,
                page,
                limit,
                +category
            );

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
            const { number } = req.params;

            let data = await this.productService.findOne(+number);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getForupdateSku = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;

            let data = await this.productService.getForupdateSku(+number);

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getNewestProducts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.productService.getNewestProducts();

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getBestSelledProducts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.productService.getBestSelledProducts();

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };

    public getForUpdateOrder = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const data = await this.productService.getForUpdateOrder(filter);

            res.status(200).json(data);
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
            const { number } = req.params;
            const productData: UpdateProductDto = req.body;

            const data = await this.productService.update(+number, productData);

            res.status(200).json({
                success: true,
                data,
                message: `Maxsulot muvafaqqiyatli tahrirlandi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public updateSkus = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { skuList, productSku }: UpdateSkuDto = req.body;

            const data = await this.productService.updateSkus(
                skuList,
                productSku
            );

            res.status(200).json(data);
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
            const { number } = req.params;

            await this.productService.delete(+number);

            res.status(200).json({
                success: true,
                message: `Maxsulot muvafaqqiyatli o'chirildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public getAllProducts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;

            const data = await this.productService.getAllProducts(
                filter,
                page,
                limit
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getCheapProductsBySettingsValue = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;

            const data =
                await this.productService.getCheapProductsBySettingsValue(
                    page,
                    limit,
                    filter
                );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllProductsAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;

            const data = await this.productService.getAllProductsAdmin(
                filter,
                page,
                limit
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getProductIds = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data = await this.productService.getProductIds();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public uploadFile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (req['files'] && req['files']['images']) {
                const images = await imageUploader(req['files']['images']);

                res.status(200).json({ images });
            } else if (req['files'] && req['files']['video']) {
                const video = await videoUploader(req['files']['video']);

                res.status(200).json({ video });
            } else res.status(400).json({ message: 'Bad Request' });
        } catch (error) {
            next(error);
        }
    };
    public getFilterOptions = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;

            const data = await this.productService.getFilterOptions(+number);

            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    };
}
