import ErrorResponse from '../shared/utils/errorResponse';
import { BrandsDao } from './dao/brands.dao';

export class BrandsService {
    private dao = new BrandsDao();

    async create(title: string) {
        return await this.dao.create(title);
    }

    async findOne(uid: number) {
        const brand = await this.dao.findOne(uid);

        if (!brand) throw new ErrorResponse(404, `Bunday ma'lumot mavjud emas`);

        return brand;
    }

    async update(uid: number, title: string) {
        const brand = await this.dao.findOne(uid);

        if (!brand) throw new ErrorResponse(404, `Bunday ma'lumot mavjud emas`);

        return await this.dao.update(uid, title);
    }

    async findAll(page: number, limit: number, filter?: string) {
        return await this.dao.getAll(page, limit, filter);
    }

    async findBycategory(categoryId: number) {
        return await this.dao.findBycategory(categoryId);
    }

    async delete(uid: number) {
        const brand = await this.dao.findOne(uid);

        if (!brand) throw new ErrorResponse(404, `bunday ma'lumot mavjud emas`);

        await this.dao.delete(uid);
    }
}
