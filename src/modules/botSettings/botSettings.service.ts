import { sendMessage } from '../shared/utils/sendMessage';
import { BotSettingsDao } from './dao/botSettings.dao';
import { SendMessage } from './dto/botSettings.dto';
import { BotSettings, EditBotSettings } from './interface/botSettings.inreface';

export default class BotSettingsService {
    private botSettingsDao = new BotSettingsDao();

    async create(user: string) {
        await this.botSettingsDao.create(user);
    }

    async update(user: string, values: EditBotSettings) {
        return await this.botSettingsDao.update(user, values);
    }

    async sendMessage(message) {
        const notAdmins = await this.botSettingsDao.getAllUsers(false);
        const admins = await this.botSettingsDao.getAllUsers(true);
        [...admins, ...notAdmins].forEach(async (user) => {
            await sendMessage(user.telegramID, message);
        });
    }

    async getOne(user: string) {
        return await this.botSettingsDao.getOne(user);
    }

    async getAllUsers(isAdmin?: boolean) {
        return await this.botSettingsDao.getAllUsers(isAdmin);
    }

    async getStreamUser(userId: string) {
        return await this.botSettingsDao.getStreamUser(userId);
    }
}
