import ExpoDao from './dao/expo.dao';
import { IExpo } from './interface/expo.interface';

export default class ExpoService {
    private expoDao = new ExpoDao();

    async create(values: IExpo) {
        const expoUser = await this.expoDao.getOne(values.userId);
        if (!expoUser) return await this.expoDao.create(values);
    }

    async getTokens() {
        return await this.expoDao.getTokens();
    }
}
