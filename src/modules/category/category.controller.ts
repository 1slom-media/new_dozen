import { NextFunction, Request, Response } from 'express';
import CategoryService from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { uploadFile } from '../shared/utils/uploadFile';
import extractQuery from '../shared/utils/extractQuery';
import { ISearchQuery } from '../shared/interface/query.interface';

export default class CategoryController {
    private categoryService = new CategoryService();

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { title, adult }: CreateCategoryDto = req.body;
            const image = await uploadFile(req['files']['avatar']);

            const data = await this.categoryService.create({
                title: JSON.parse(title),
                adult: adult ? JSON.parse(adult) : null,
                avatar: image[0],
            });

            res.status(201).json({
                success: true,
                data,
                message: `Kategoriya muvafaqqiyatli yaratildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public createSubCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;
            const values: CreateCategoryDto = req.body;
            if (values.adult) values.adult = JSON.parse(values.adult);

            const data = await this.categoryService.create(
                {
                    title: JSON.parse(values.title),
                    adult: values.adult,
                },
                +number
            );

            res.status(201).json({
                success: true,
                data,
                message: `Kategoriya muvafaqqiyatli yaratildi`,
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
            const data = await this.categoryService.getAll();

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getAllForAdmin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const { limit, page } = extractQuery(query).sorts;
            const data = await this.categoryService.getAllForAdmin(
                page,
                limit,
                filter
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
            const { query } = req;
            const { filter }: ISearchQuery = query;
            const {
                limit,
                page,
                color,
                minPrice,
                maxPrice,
                brand,
                sorting,
                ordering,
            } = extractQuery(query).sorts;

            const data = await this.categoryService.findOne(
                Number(number),
                filter,
                page,
                limit,
                color?.includes(',') ? color.split(',') : [color],
                +minPrice,
                +maxPrice,
                brand && brand?.includes(',') ? brand.split(',') : [brand],
                sorting,
                ordering
            );

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    };

    public getOneCategory = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { number } = req.params;
            const data = await this.categoryService.getOneCategory(
                Number(number)
            );

            res.status(200).json(data);
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
            const categoryData: UpdateCategoryDto = req.body;
            categoryData.adult = categoryData.adult
                ? JSON.parse(categoryData.adult)
                : null;
            categoryData.title = categoryData.title
                ? JSON.parse(categoryData.title)
                : null;
            if (req['files']) {
                const image = await uploadFile(req['files']['avatar']);
                categoryData.avatar = image[0];
            }

            const data = await this.categoryService.update(
                Number(id),
                categoryData
            );

            res.status(200).json({
                success: true,
                data,
                message: `Kategoriya muvafaqqiyatli tahrirlandi`,
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

            await this.categoryService.delete(Number(id));

            res.status(200).json({
                success: true,
                message: `Kategoriya muvafaqqiyatli o'chirildi`,
            });
        } catch (error) {
            next(error);
        }
    };

    public getCount = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const count = await this.categoryService.getCount(
                Number(req.params.id)
            );
            res.status(200).json(count);
        } catch (error) {
            next(error);
        }
    };
}
