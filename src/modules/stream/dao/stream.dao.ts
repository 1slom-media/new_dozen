import { UserModel } from 'modules/user/model/user.model';
import ErrorResponse from '../../shared/utils/errorResponse';
import { IStream } from '../interface/stream.interface';
import { StreamModel } from '../model/stream.model';
import { UpdateStreamDto } from '../dto/stream.dto';

export default class StreamDao {
    async create(streamData: IStream) {
        let message = undefined;
        const stream = new StreamModel(streamData);
        await stream
            .save()
            .catch((err) => (message = err.message.split(': ')[2]));

        if (message) {
            throw new ErrorResponse(400, message);
        }

        return stream;
    }

    async getAll(userId: string, page: number, limit: number, filter: string) {
        const countStream = await StreamModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $addFields: {
                    numberStr: {
                        $toString: '$number',
                    },
                },
            },
            {
                $match: {
                    user: userId,
                    $or: [
                        {
                            name: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            numberStr: {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $count: 'Total',
            },
        ]);

        const statusValues = [
            'new',
            'ready',
            'onway',
            'delivered',
            'canceled',
            'hold',
            'archived',
            'pending',
        ];
        const streams = await StreamModel.aggregate([
            {
                $project: {
                    new: 0,
                    ready: 0,
                    onway: 0,
                    delivered: 0,
                    canceled: 0,
                    hold: 0,
                    archived: 0,
                    pending: 0,
                },
            },
            {
                $match: {
                    isDeleted: false,
                },
            },
            {
                $addFields: {
                    numberStr: {
                        $toString: '$number',
                    },
                },
            },
            {
                $match: {
                    user: userId,
                    $or: [
                        {
                            name: {
                                $regex: filter,
                                $options: 'i',
                            },
                        },
                        {
                            numberStr: {
                                $regex: filter,
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'streamId',
                    as: 'orders',
                },
            },
            {
                $addFields: statusValues.reduce((acc, status) => {
                    acc[status] = {
                        $size: {
                            $filter: {
                                input: '$orders',
                                as: 'order',
                                cond: { $eq: ['$$order.status', status] },
                            },
                        },
                    };
                    return acc;
                }, {}),
            },
            {
                $project: { orders: 0 },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: 'uid',
                    as: 'product',
                },
            },
            {
                $unwind: {
                    path: '$product',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    'product.description': 0,
                    'product.createdAt': 0,
                    'product.updatedAt': 0,
                    'product.category': 0,
                    numberStr: 0,
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
        return {
            countPage: countStream[0]
                ? Math.ceil(countStream[0]['Total'] / limit)
                : 0,
            streams,
        };
    }

    async getOne(number: number) {
        const stream = await StreamModel.aggregate([
            {
                $match: {
                    number,
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: 'uid',
                    as: 'product',
                },
            },
            {
                $addFields: {
                    product: { $first: '$product' },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: 'uid',
                    as: 'category',
                },
            },
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$category.parent',
                    connectFromField: 'parent',
                    connectToField: 'uid',
                    as: 'parentCategories',
                    maxDepth: 10,
                    depthField: 'level',
                },
            },
            {
                $addFields: {
                    category: {
                        $let: {
                            vars: { category: { $first: '$category' } },
                            in: {
                                $mergeObjects: [
                                    '$$category',
                                    {
                                        parent: {
                                            $let: {
                                                vars: {
                                                    parent: {
                                                        $first: {
                                                            $filter: {
                                                                input: '$parentCategories',
                                                                cond: {
                                                                    $eq: [
                                                                        '$$this.level',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: {
                                                    $mergeObjects: [
                                                        '$$parent',
                                                        {
                                                            parent: {
                                                                $first: {
                                                                    $filter: {
                                                                        input: '$parentCategories',
                                                                        cond: {
                                                                            $eq: [
                                                                                '$$this.level',
                                                                                1,
                                                                            ],
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'product.brand',
                    foreignField: 'uid',
                    as: 'brand',
                },
            },
            {
                $lookup: {
                    from: 'subfeatures',
                    localField: 'product.characteristics.values.uid',
                    foreignField: 'uid',
                    as: 'features',
                },
            },
            {
                $lookup: {
                    from: 'features',
                    localField: 'product.characteristics.uid',
                    foreignField: 'uid',
                    as: 'characteristics',
                },
            },
            {
                $addFields: {
                    brand: '$product.brand.title',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'product.uid',
                    foreignField: 'productId',
                    as: 'skuList',
                },
            },
            {
                $addFields: {
                    product: {
                        $mergeObjects: [
                            '$product',
                            {
                                skuList: '$skuList',
                                brand: { $first: '$brand' },
                                characteristics: {
                                    $map: {
                                        input: '$characteristics',
                                        as: 'character',
                                        in: {
                                            $mergeObjects: [
                                                '$$character',
                                                {
                                                    values: {
                                                        $filter: {
                                                            input: '$features',
                                                            as: 'value',
                                                            cond: {
                                                                $eq: [
                                                                    '$$value.charId',
                                                                    '$$character.uid',
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                purchasePrice: {
                                    $reduce: {
                                        input: '$skuList',
                                        initialValue: Infinity,
                                        in: {
                                            $min: [
                                                '$$value.purchasePrice',
                                                '$$this.purchasePrice',
                                            ],
                                        },
                                    },
                                },
                                quantitySold: {
                                    $reduce: {
                                        input: '$skuList',
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                '$$value',
                                                '$$this.quantitySold',
                                            ],
                                        },
                                    },
                                },
                                totalAvailableAmount: {
                                    $reduce: {
                                        input: '$skuList',
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                '$$value',
                                                '$$this.availableAmount',
                                            ],
                                        },
                                    },
                                },
                                category: '$category',
                            },
                        ],
                    },
                },
            },
            {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    'product.createdAt': 0,
                    'product.updatedAt': 0,
                    'product.category._id': 0,
                    'product.category.adult': 0,
                    'product.category.createdAt': 0,
                    'product.category.updatedAt': 0,
                    'product.category.__v': 0,
                    'product.category.parent._id': 0,
                    'product.category.parent.adult': 0,
                    'product.category.parent.createdAt': 0,
                    'product.category.parent.updatedAt': 0,
                    'product.category.parent.__v': 0,
                    'product.category.parent.level': 0,
                    'product.category.parent.parent._id': 0,
                    'product.category.parent.parent.adult': 0,
                    'product.category.parent.parent.createdAt': 0,
                    'product.category.parent.parent.updatedAt': 0,
                    'product.category.parent.parent.__v': 0,
                    'product.category.parent.parent.avatar': 0,
                    'product.category.parent.parent.level': 0,
                    'product.sku': 0,
                    'product.characteristics._id': 0,
                    'product.characteristics.updatedAt': 0,
                    'product.characteristics.createdAt': 0,
                    'product.characteristics.__v': 0,
                    'product.characteristics.values._id': 0,
                    'product.characteristics.values.updatedAt': 0,
                    'product.characteristics.values.createdAt': 0,
                    'product.characteristics.values.__v': 0,
                    'product.characteristics.values.charId': 0,
                    'product.characteristics.values.sku': 0,
                    'product.features': 0,
                    'product.skulist._id': 0,
                    'product.skulist.productId': 0,
                    'product.skulist.characteristics._id': 0,
                    'product.skulist.characteristicsTitle': 0,
                    'product.skulist.skuTitle': 0,
                    'product.skulist.barcode': 0,
                    category: 0,
                    parentCategories: 0,
                    features: 0,
                    characteristics: 0,
                    skuList: 0,
                    isDeleted: 0,
                },
            },
        ]);

        return stream[0];
    }

    async findById(id: string) {
        return await StreamModel.findById(id);
    }

    async updateStream(id: string, values: UpdateStreamDto) {
        const stream = await StreamModel.findByIdAndUpdate(id, values, {
            new: true,
        });

        return stream;
    }

    async delete(streamId: string) {
        const stream = await StreamModel.findById(streamId);
        return await stream.delete();
    }

    async updateForUser(streamId: number, status: boolean) {
        const stream = await StreamModel.findOne({ number: streamId });

        stream.isRegionOn = status;
        return await stream.save();
    }

    async getAllStreamNumber() {
        return await StreamModel.find().select('number');
    }

    async getDetailStream(number: number, user: string) {
        const statusValues = [
            'new',
            'ready',
            'onway',
            'delivered',
            'canceled',
            'hold',
            'archived',
            'pending',
        ];

        const pipeline = [
            {
                $match: {
                    number,
                    user,
                },
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'streamId',
                    as: 'orders',
                },
            },
            {
                $addFields: statusValues.reduce((acc, status) => {
                    acc[status] = {
                        $size: {
                            $filter: {
                                input: '$orders',
                                as: 'order',
                                cond: { $eq: ['$$order.status', status] },
                            },
                        },
                    };
                    return acc;
                }, {}),
            },
            {
                $project: { orders: 0, product: 0 },
            },
        ];

        try {
            const streamWithCounts = await StreamModel.aggregate(pipeline);
            const populatedStream = await StreamModel.aggregate([
                {
                    $match: {
                        number,
                        user,
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: 'uid',
                        as: 'product',
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'product.uid',
                        foreignField: 'productId',
                        as: 'variants',
                    },
                },
                {
                    $addFields: {
                        product: {
                            $let: {
                                vars: {
                                    product: { $first: '$product' },
                                    referalPrice: {
                                        $reduce: {
                                            input: '$variants',
                                            initialValue: Infinity,
                                            in: {
                                                $min: [
                                                    '$$value.referalPrice',
                                                    '$$this.referalPrice',
                                                ],
                                            },
                                        },
                                    },
                                },
                                in: {
                                    image: {
                                        $arrayElemAt: [
                                            '$$product.images.image.540.high',
                                            0,
                                        ],
                                    },
                                    title: '$$product.title',
                                    referalPrice: '$$referalPrice',
                                },
                            },
                        },
                    },
                },
                { $project: { variants: 0 } },
            ]);
            console.log(populatedStream);

            if (populatedStream) {
                Object.assign(populatedStream[0], streamWithCounts[0]);
            }

            return populatedStream[0];
        } catch (err) {
            console.log(err);
        }
    }

    async getStreams(user: string) {
        return await StreamModel.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: 'uid',
                    as: 'product',
                },
            },
            {
                $project: {
                    _id: 1,
                    product: 1,
                },
            },
            { $match: { isDeleted: false } },
        ]);
    }

    async findByUserId(id: string) {
        return await StreamModel.find({ user: id }).select('visits_count');
    }
}
