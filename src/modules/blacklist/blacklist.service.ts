import BlackListDao from './dao/blacklist.dao';
import { CreateBlackListDto } from './dto/blacklist.dto';

export default class BlackListService {
    private blackListDao = new BlackListDao();

    async create(values: CreateBlackListDto) {
        return await this.blackListDao.create(values);
    }

    async update(id: string, isBlock: boolean) {
        return await this.blackListDao.update(id, isBlock);
    }

    async delete(id: string) {
        await this.blackListDao.delete(id);
    }

    async getAll(filter: string = '', page: number, limit: number) {
        return await this.blackListDao.getAll(filter, page, limit);
    }

    async findOne(phone: string) {
        return await this.blackListDao.findOne(phone);
    }
}
