import mongoose from 'mongoose';
import { RequestModel } from '../model/request.model';

export default class RequestDao {
    async getAll(
        id: string,
        page: number,
        status?: string,
        from?: number,
        to?: number
    ) {
        const pageCount = await RequestModel.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order',
                    foreignField: '_id',
                    as: 'orders',
                },
            },
            {
                $lookup: {
                    from: 'streams',
                    localField: 'orders.streamId',
                    foreignField: '_id',
                    as: 'streams',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'streams.user',
                    foreignField: '_id',
                    as: 'users',
                },
            },
            {
                $addFields: {
                    status: { $first: '$orders.status' },
                    createdAt: '$createdAt',
                    id: { $first: '$users._id' },
                },
            },
            {
                $unwind: {
                    path: '$users',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$orders',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    status: 1,
                    createdAt: 1,
                    id: 1,
                },
            },
            {
                $match: {
                    id: new mongoose.Types.ObjectId(id),
                    $or: [
                        {
                            status: {
                                $regex: status ? status : '',
                                $options: 'i',
                            },
                        },
                        {
                            createdAt: { $gte: from, $lt: to },
                        },
                    ],
                },
            },
            { $count: 'Total' },
        ]);

        const requests = await RequestModel.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order',
                    foreignField: '_id',
                    as: 'orders',
                },
            },
            {
                $lookup: {
                    from: 'streams',
                    localField: 'orders.streamId',
                    foreignField: '_id',
                    as: 'streams',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'streams.user',
                    foreignField: '_id',
                    as: 'users',
                },
            },
            {
                $addFields: {
                    status: { $first: '$orders.status' },
                    city: { $first: '$orders.city_id' },
                    name: { $first: '$orders.name' },
                    msg: '$msg',
                    updatedAt: '$updatedAt',
                    phone: { $first: '$orders.phone' },
                    number: { $first: '$orders.number' },
                    id: { $first: '$users._id' },
                },
            },
            {
                $unwind: {
                    path: '$orders',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$users',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    phone: {
                        $concat: [
                            { $substr: ['$phone', 0, 6] },
                            '***',
                            { $substr: ['$phone', 8, 4] },
                        ],
                    },
                    status: 1,
                    city: 1,
                    name: 1,
                    msg: 1,
                    updatedAt: 1,
                    id: 1,
                    number: 1,
                },
            },
            {
                $match: {
                    id: new mongoose.Types.ObjectId(id),
                    $or: [
                        {
                            status: {
                                $regex: status ? status : '',
                                $options: 'i',
                            },
                        },
                        {
                            updatedAt: { $gte: from, $lt: to },
                        },
                    ],
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            { $skip: (page - 1) * 20 },
            { $limit: 20 },
        ]);

        return {
            requests,
            pageCount: pageCount[0] ? Math.ceil(pageCount[0]['Total'] / 20) : 0,
        };
    }

    async getByOrderId(orderId: string) {
        return await RequestModel.find({ order: orderId });
    }

    async create(orderId: string, msg: string) {
        const request = new RequestModel({
            order: orderId,
            msg: msg,
        });
        return await request.save();
    }

    async findAndUpdate(orderId: string, msg: string) {
        return await RequestModel.findOneAndUpdate(
            {
                order: orderId,
            },
            { msg },
            { new: true }
        );
    }
}
