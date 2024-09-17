import ErrorResponse from '../shared/utils/errorResponse';
import SettingDao from './dao/setting.dao';
import { CreateSettingDto } from './dto/setting.dto';

export default class SettingService {
    private settingDao = new SettingDao();

    async create(values: CreateSettingDto) {
        return await this.settingDao.create(values);
    }

    async updateToken(token: string) {
        await this.settingDao.updateToken(token);
    }

    async getSetting() {
        const settings = await this.settingDao.getSetting();
        // if (settings.length === 0) {
        //     throw new ErrorResponse(400, 'Sayt sozlamalari qilinmagan!');
        // }
        return settings;
    }

    async getEskizToken() {
        return await this.settingDao.getEskizToken();
    }
}
