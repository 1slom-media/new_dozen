import mongoose from 'mongoose';
import { IPayment } from '../interface/payment.interface';
import { PaymentModel } from '../model/payment.model';

export default class PaymentDao {
    async create(values: IPayment) {
        const payment = new PaymentModel(values);
        await payment.save();
        return payment;
    }

    async findOne(userId: string, status?: string) {
        if (status) return await PaymentModel.find({ user: userId, status });

        return await PaymentModel.find({
            user: new mongoose.Types.ObjectId(userId),
        }).sort({ createdAt: 1 });
    }

    async findById(id: string) {
        return await PaymentModel.findById(id);
    }

    async getAll(
        userId: string,
        page: number,
        limit: number,
        select: string = '-updatedAt'
    ) {
        const countPage = await PaymentModel.find({ user: userId }).count();
        const payments = await PaymentModel.find({ user: userId })
            .populate('user', 'name')
            .select(select)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        return { payments, countPage: Math.ceil(countPage / limit) };
    }

    async update(id: string, values: any) {
        return await PaymentModel.findByIdAndUpdate(id, values, { new: true });
    }

    async getPaidPayment() {
        const payments = await PaymentModel.aggregate([
            {
                $sort: { createdAt: -1 },
            },
            {
                $match: {
                    status: 'fulfilled',
                },
            },
            {
                $project: {
                    name: 1,
                    card: 1,
                    amount: 1,
                    updatedAt: 1,
                    status: 1,
                },
            },
            {
                $limit: 4,
            },
        ]);
        return payments;
    }

    async getAllAdmin(
        page?: number,
        limit: number = 20,
        from?: number,
        to?: number,
        status?: string,
        filter?: string
    ) {
        if (status) {
            const countPage = await PaymentModel.aggregate([
                {
                    $addFields: {
                        uidStr: {
                            $toString: '$uid',
                        },
                    },
                },
                {
                    $match: {
                        status: {
                            $regex: status ? status : '',
                            $options: 'i',
                        },
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
                        id: '$user._id',
                        name: '$user.name',
                    },
                },
                {
                    $unwind: {
                        path: '$id',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $unwind: {
                        path: '$name',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                name: {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                uidStr: {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                card: {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                createdAt: { $gte: from, $lt: to },
                            },
                        ],
                    },
                },
                { $sort: { createdAt: -1 } },
                { $count: 'Total' },
            ]);
            const payments = await PaymentModel.aggregate([
                {
                    $addFields: {
                        uidStr: {
                            $toString: '$uid',
                        },
                    },
                },
                {
                    $match: {
                        status: status,
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
                        id: '$user._id',
                        name: '$user.name',
                        isAdmin: '$user.isAdmin',
                        isOperator: '$user.isOperator',
                    },
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                name: {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                uidStr: {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                card: {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                createdAt: { $gte: from, $lt: to },
                            },
                        ],
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        message: 1,
                        status: 1,
                        uid: 1,
                        amount: 1,
                        card: 1,
                        createdAt: 1,
                        id: { $first: '$id' },
                        name: { $first: '$name' },
                        isAdmin: { $first: '$isAdmin' },
                        isOperator: { $first: '$isOperator' },
                    },
                },
            ]);

            return {
                payments,
                countPage: countPage[0]
                    ? Math.ceil(countPage[0]['Total'] / limit)
                    : 0,
            };
        }

        const countPage = await PaymentModel.aggregate([
            {
                $addFields: {
                    uidStr: {
                        $toString: '$uid',
                    },
                },
            },
            {
                $match: {
                    status: {
                        $regex: status ? status : '',
                        $options: 'i',
                    },
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
                    id: '$user._id',
                    name: '$user.name',
                },
            },
            {
                $unwind: {
                    path: '$id',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$name',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    $or: [
                        {
                            name: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            uidStr: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            card: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            createdAt: { $gte: from, $lt: to },
                        },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            { $count: 'Total' },
        ]);
        const payments = await PaymentModel.aggregate([
            {
                $addFields: {
                    uidStr: {
                        $toString: '$uid',
                    },
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
                    id: '$user._id',
                    name: '$user.name',
                    isAdmin: '$user.isAdmin',
                    isOperator: '$user.isOperator',
                },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    $or: [
                        {
                            name: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            uidStr: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            card: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            createdAt: { $gte: from, $lt: to },
                        },
                    ],
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    message: 1,
                    status: 1,
                    uid: 1,
                    amount: 1,
                    card: 1,
                    createdAt: 1,
                    id: { $first: '$id' },
                    name: { $first: '$name' },
                    isAdmin: { $first: '$isAdmin' },
                    isOperator: { $first: '$isOperator' },
                },
            },
        ]);

        return {
            payments,
            countPage: countPage[0]
                ? Math.ceil(countPage[0]['Total'] / limit)
                : 0,
        };
    }
}
