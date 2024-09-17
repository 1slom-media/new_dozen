import { IExpo } from '../interface/expo.interface';
import { ExpoModel } from '../model/expo.model';

export default class ExpoDao {
    async create(values: IExpo) {
        const expoUser = new ExpoModel(values);

        return await expoUser.save();
    }

    async getTokens() {
        return await ExpoModel.find();
    }

    async getOne(userId: string) {
        return await ExpoModel.findOne({ userId });
    }
}
