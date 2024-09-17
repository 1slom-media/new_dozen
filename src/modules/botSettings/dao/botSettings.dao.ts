import mongoose from 'mongoose';
import {
    BotSettings,
    EditBotSettings,
} from '../interface/botSettings.inreface';
import { BotModel } from '../model/botSettings.model';

export class BotSettingsDao {
    async create(user: string) {
        BotModel.findOne({ user }, async (err, data) => {
            if (!data) {
                const bot = new BotModel({ user });
                await bot.save();
            }
        });
    }

    async update(user: string, values: EditBotSettings) {
        return await BotModel.findOneAndUpdate({ user }, values, { new: true });
    }

    async getOne(user: string) {
        return await BotModel.findOne({ user });
    }

    async getAllUsers(isAdmin: boolean = false) {
        return await BotModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $addFields: {
                    telegramID: '$user.telegramID',
                    isAdmin: '$user.isAdmin',
                },
            },
            {
                $unwind: {
                    path: '$telegramID',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$isAdmin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    telegramID: 1,
                    archived: 1,
                    canceled: 1,
                    delivered: 1,
                    hold: 1,
                    onway: 1,
                    payment: 1,
                    pending: 1,
                    ready: 1,
                    new_product: 1,
                    new_order: 1,
                    update_product: 1,
                    isAdmin: 1,
                },
            },
            {
                $match: {
                    isAdmin: isAdmin,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);
    }

    async getStreamUser(userId: string) {
        return await BotModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $addFields: {
                    telegramID: '$user.telegramID',
                    isAdmin: '$user.isAdmin',
                },
            },
            {
                $unwind: {
                    path: '$telegramID',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$isAdmin',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    telegramID: 1,
                    archived: 1,
                    canceled: 1,
                    delivered: 1,
                    hold: 1,
                    onway: 1,
                    payment: 1,
                    pending: 1,
                    ready: 1,
                    new_product: 1,
                    new_order: 1,
                    update_product: 1,
                    isAdmin: 1,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);
    }
}
