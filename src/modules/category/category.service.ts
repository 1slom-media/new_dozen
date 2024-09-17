import { UpdateCategoryDto } from './dto/category.dto';
import CategoryDao from './dao/category.dao';
import { ICategory, ICreateCategory } from './interface/category.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import ProductService from '../product/product.service';

export default class CategoryService {
    private categoryDao = new CategoryDao();
    private productService = new ProductService();

    async create(
        { title, avatar, adult }: ICreateCategory,
        categoryId?: number
    ) {
        const category = await this.categoryDao.cerate(
            {
                title,
                avatar,
                adult,
            },
            categoryId
        );

        return category;
    }

    async getAll() {
        return this.categoryDao.getAll();
    }

    async getAllForAdmin(page: number, limit: number, filter: string) {
        return this.categoryDao.getAllForAdmin(page, limit, filter);
    }

    async findOne(
        id: number,
        filter?: string,
        page?: number,
        limit?: number,
        color?: string[],
        minPrice?: number,
        maxPrice?: number,
        brand?: string[],
        sorting?: string,
        ordering?: string
    ) {
        const foundCategory: ICategory = await this.categoryDao.getById(id);

        if (!foundCategory) {
            throw new ErrorResponse(404, 'Bunday kategoriya mavjud emas!');
        }

        const { products, countPage, size, prices } =
            await this.productService.getByCategoryId({
                filter,
                page,
                limit,
                categoryId: id,
                color,
                minPrice,
                maxPrice,
                brand,
                sorting,
                ordering,
            });

        return { category: foundCategory, products, countPage, size, prices };
    }

    async getOneCategory(id: number) {
        const foundCategory: ICategory = await this.categoryDao.getById(id);

        return foundCategory;
    }

    async getCount(id: number) {
        const foundCategory: ICategory = await this.categoryDao.getById(id);

        if (!foundCategory) {
            throw new ErrorResponse(404, 'Bunday kategoriya mavjud emas!');
        }

        const count = await this.productService.getCount(id);

        return count;
    }

    async update(id: number, values: UpdateCategoryDto) {
        const foundCategory: ICategory = await this.categoryDao.getById(id);

        if (!foundCategory) {
            throw new ErrorResponse(404, 'Bunday kategoriya topilmadi!');
        }

        return await this.categoryDao.update(id, values);
    }

    async delete(id: number) {
        const foundCategory: ICategory = await this.categoryDao.getById(id);

        if (!foundCategory) {
            throw new ErrorResponse(404, 'Bunday kategoriya topilmadi!');
        }

        return await this.categoryDao.delete(id);
    }
}
