import { BotModel } from '../../botSettings/model/botSettings.model';
import { UpdateUserDto } from '../dto/user.dto';
import { IUser } from '../interface/user.interface';
import { UserModel } from '../model/user.model';

export default class UserDao {
    async cerate(userData: IUser): Promise<any> {
        var result;
        await new Promise((resolve, _) =>
            UserModel.findOne({ phone: userData.phone }, async (err, data) => {
                if (!data) {
                    let user = new UserModel(userData);
                    await user.save();
                    await BotModel.create({ user: user._id });
                    result = user;
                    resolve('success');
                } else if (data && !data['smsCode']) {
                    let user = await UserModel.findById(data._id);
                    user.smsCode = userData.smsCode;
                    await user.save();
                    await BotModel.create({ user: user._id });
                    result = user;
                    resolve('success');
                } else if (data && data['smsCode'] && userData.smsCode) {
                    result = await UserModel.findByIdAndUpdate(data._id, {
                        smsCode: userData.smsCode,
                    });
                    resolve('success');
                }
            })
        );
        return result;
    }

    async getAll(
        operator: boolean,
        select: string = '-password',
        filter: string,
        page: number,
        limit: number
    ) {
        const pageCount = await UserModel.find({ isOperator: operator })
            .or([
                {
                    name: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    phone: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const users = await UserModel.find({ isOperator: operator })
            .or([
                {
                    name: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    phone: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .limit(limit)
            .skip((page - 1) * limit)
            .select(select);
        return { users, pageCount: Math.ceil(pageCount / limit) };
    }

    async findOne(userId: string, select: string = '-password') {
        if (select) {
            return await UserModel.findOne({ _id: userId }).select(select);
        }
        return await UserModel.findOne({ _id: userId });
    }

    async findOneForAuth(phone: string) {
        return await UserModel.findOne({ phone });
    }

    async update(userId: string, values: UpdateUserDto) {
        const user = await UserModel.findByIdAndUpdate(userId, values, {
            new: true,
        });

        return user;
    }

    async delete(userId: string) {
        const user = await UserModel.deleteOne({ _id: userId });

        return user;
    }

    async searchGlobal(filter: string) {
        return await UserModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            name: {
                                $regex: '.*' + filter + '.*',
                                $options: 'i',
                            },
                        },
                        {
                            phone: {
                                $regex: '.*' + filter + '.*',
                                $options: 'i',
                            },
                        },
                        {
                            telegramID: {
                                $regex: '.*' + filter + '.*',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
        ]);
    }

    async checkIfUserExists(id: number) {
        return await UserModel.findOne({ telegramID: id });
    }

    async getAllAdmins() {
        return await UserModel.find({ isAdmin: true });
    }

    async getExpoTokens() {
        return await UserModel.aggregate([
            {
                $match: {
                    isOperator: true,
                },
            },
            {
                $project: {
                    expoToken: 1,
                },
            },
        ]);
    }

    async getAllBalance() {
        const admins = await UserModel.aggregate([
            {
                $match: {
                    isAdmin: false,
                    isOperator: false,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$balance',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    balance: { $add: ['$total'] },
                },
            },
        ]);

        const operators = await UserModel.aggregate([
            {
                $match: {
                    isAdmin: false,
                    isOperator: true,
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$balance',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    balance: { $add: ['$total'] },
                },
            },
        ]);

        return {
            adminBalance: admins,
            operatorBalance: operators,
        };
    }

    async getByIPDuringOneDay(ip: string) {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const fondUsersCount = await UserModel.find({
            ip,
            createdAt: { $gte: twentyFourHoursAgo },
        }).count();

        return fondUsersCount;
    }
}
