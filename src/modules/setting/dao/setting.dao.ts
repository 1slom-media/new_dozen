import { IStetting } from '../interface/setting.interface';
import { SettingModel } from '../model/setting.model';

export default class SettingDao {
    async create(values: IStetting) {
        const settings = await SettingModel.find();
        if (settings.length === 0) {
            const setting = new SettingModel(values);
            await setting.save();
            return setting;
        } else {
            return await SettingModel.findByIdAndUpdate(
                settings[0]._id,
                values,
                { new: true }
            );
        }
    }

    async updateToken(token: string) {
        const settings = await SettingModel.find();
        if (settings.length === 0) {
            const setting = new SettingModel({ eskiz_token: token });
            await setting.save();
        }
        await SettingModel.updateMany({}, { eskiz_token: token });
    }

    async getSetting() {
        return await SettingModel.find().select('-eskiz_token');
    }

    async getEskizToken() {
        const data = await SettingModel.find();

        return data[0]?.eskiz_token;
    }
}
