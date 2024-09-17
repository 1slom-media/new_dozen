import { IBlacklist } from '../interface/blacklist.interface';
import { BlackListModel } from '../model/blacklist.model';

export default class BlackListDao {
    async create(values: IBlacklist) {
        const blackedUser = new BlackListModel(values);
        await blackedUser.save();
        return blackedUser;
    }

    async update(id: string, isBlock: boolean) {
        return await BlackListModel.findByIdAndUpdate(
            id,
            { isBlock },
            { new: true }
        );
    }

    async delete(id: string) {
        await BlackListModel.findByIdAndDelete(id);
    }

    async getAll(filter: string, page: number, limit: number) {
        const countPage = await BlackListModel.find()
            .or([
                {
                    phone: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const users = await BlackListModel.find()
            .or([
                {
                    phone: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .skip((page - 1) * limit)
            .limit(limit);

        return { users, countPage: Math.ceil(countPage / limit) };
    }

    async findOne(phone: string) {
        return await BlackListModel.findOne({ phone }).select('isBlock');
    }
}
