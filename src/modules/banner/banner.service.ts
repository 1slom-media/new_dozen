import ErrorResponse from '../shared/utils/errorResponse';
import { BannersDao } from './dao/banner.dao';
import { IBanner } from './interface/banner.interface';

export class BannersService {
    private bannersDao = new BannersDao();

    async create(values: IBanner) {
        return await this.bannersDao.create(values);
    }

    async getAll() {
        return await this.bannersDao.getAll();
    }

    async getAllForAdmin() {
        return await this.bannersDao.getAllForAdmin();
    }

    async delete(id: string) {
        const banner = await this.bannersDao.getOne(id);

        if (!banner) throw new ErrorResponse(404, 'Bunday banner mavjud emas');

        return await this.bannersDao.delete(id);
    }

    async update(id: string, isActive: boolean) {
        const banner = await this.bannersDao.getOne(id);

        if (!banner) throw new ErrorResponse(404, 'Bunday banner mavjud emas');

        return await this.bannersDao.update(id, isActive);
    }
}
