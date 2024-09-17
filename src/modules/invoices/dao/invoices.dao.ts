import { CreateInvoiceDto } from '../dto/invoices.dto';
import { InvoicesModel } from '../model/invoices.model';

export class InvoicesDao {
    async create(values: CreateInvoiceDto) {
        const invoice = new InvoicesModel(values);

        return await invoice.save();
    }

    async delete(id: string) {
        await InvoicesModel.findOneAndDelete({ order_id: id });
    }

    async getAll(
        status: string = '',
        limit: number,
        page: number,
        filter: string = '',
        from?: Date,
        to?: Date,
        region?: string
    ) {
        if (region?.length && !region?.includes('undefined')) {
            const splitRegion = region.split(',');
            if (limit && limit !== 10) {
                if (status) {
                    var countPageMatch: any[] = [
                        {
                            $addFields: {
                                numberStr: {
                                    $toString: '$uid',
                                },
                            },
                        },
                        {
                            $match: {
                                $or: [
                                    {
                                        name: {
                                            $regex: filter,
                                            $options: 'i',
                                        },
                                    },
                                    {
                                        phone: {
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
                                    {
                                        createdAt: {
                                            $gt: new Date(from),
                                            $lt: new Date(to),
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: 'orders',
                                localField: 'order_id',
                                foreignField: '_id',
                                as: 'orders',
                            },
                        },
                        {
                            $addFields: {
                                status: { $first: '$orders.status' },
                                name: '$name',
                                phone: '$phone',
                                uid: '$uid',
                                createdAt: '$createdAt',
                                updatedAt: '$updatedAt',
                                city_id: { $first: '$orders.city_id' },
                                extra_info: { $first: '$orders.extra_info' },
                                address: { $first: '$orders.address' },
                                orderItems: { $first: '$orders.orderItems' },
                                cityIdString: {
                                    $toString: { $first: '$orders.city_id' },
                                },
                            },
                        },
                        {
                            $match: {
                                status: {
                                    $regex: status,
                                    $options: 'i',
                                },
                                cityIdString: { $in: splitRegion },
                            },
                        },
                        {
                            $count: 'Total',
                        },
                    ];

                    const countPage = await InvoicesModel.aggregate(
                        countPageMatch
                    );

                    var invoicesMatch: any[] = [
                        {
                            $addFields: {
                                numberStr: {
                                    $toString: '$uid',
                                },
                            },
                        },
                        {
                            $match: {
                                $or: [
                                    {
                                        name: {
                                            $regex: filter,
                                            $options: 'i',
                                        },
                                    },
                                    {
                                        phone: {
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
                                    {
                                        createdAt: { $gt: from, $lt: to },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: 'orders',
                                localField: 'order_id',
                                foreignField: '_id',
                                as: 'orders',
                            },
                        },
                        {
                            $addFields: {
                                status: { $first: '$orders.status' },
                                name: '$name',
                                phone: '$phone',
                                uid: '$uid',
                                createdAt: '$createdAt',
                                updatedAt: '$updatedAt',
                                city_id: { $first: '$orders.city_id' },
                                extra_info: { $first: '$orders.extra_info' },
                                orderId: { $first: '$orders.number' },
                                address: { $first: '$orders.address' },
                                orderItems: { $first: '$orders.orderItems' },
                                cityIdString: {
                                    $toString: { $first: '$orders.city_id' },
                                },
                            },
                        },
                        {
                            $match: {
                                status: {
                                    $regex: status,
                                    $options: 'i',
                                },
                                cityIdString: { $in: splitRegion },
                            },
                        },
                        {
                            $lookup: {
                                from: 'skus',
                                localField: 'orderItems.variantId',
                                foreignField: 'uid',
                                as: 'variant',
                            },
                        },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'variant.productId',
                                foreignField: 'uid',
                                as: 'product',
                            },
                        },
                        {
                            $addFields: {
                                products: {
                                    $map: {
                                        input: {
                                            $range: [0, { $size: '$variant' }],
                                        },
                                        as: 'index',
                                        in: {
                                            title: {
                                                $arrayElemAt: [
                                                    '$product.title',
                                                    '$$index',
                                                ],
                                            },
                                            image: {
                                                $first: {
                                                    $arrayElemAt: [
                                                        '$product.images',
                                                        '$$index',
                                                    ],
                                                },
                                            },
                                            price: {
                                                $arrayElemAt: [
                                                    '$variant.purchasePrice',
                                                    '$$index',
                                                ],
                                            },
                                            quantity: {
                                                $arrayElemAt: [
                                                    '$orderItems.quantity',
                                                    '$$index',
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                products: '$products',
                                price: {
                                    $reduce: {
                                        input: '$products',
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                '$$value',
                                                {
                                                    $multiply: [
                                                        '$$this.price',
                                                        '$$this.quantity',
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                uid: 1,
                                status: 1,
                                name: 1,
                                phone: 1,
                                city_id: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                extra_info: 1,
                                address: 1,
                                orderId: 1,
                            },
                        },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        { $sort: { uid: -1 } },
                    ];

                    const invoices = await InvoicesModel.aggregate(
                        invoicesMatch
                    );

                    return {
                        invoices,
                        countPage: countPage[0]
                            ? Math.ceil(countPage[0]['Total'] / limit)
                            : 0,
                        size: countPage[0] ? countPage[0]['Total'] : 0,
                    };
                }
                var countPageMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: { $gt: from, $lt: to },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            address: { $first: '$orders.address' },
                            orderItems: { $first: '$orders.orderItems' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: { cityIdString: { $in: splitRegion } },
                    },
                    {
                        $count: 'Total',
                    },
                ];

                const countPage = await InvoicesModel.aggregate(countPageMatch);

                var invoicesMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: { $gt: from, $lt: to },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            orderItems: { $first: '$orders.orderItems' },
                            address: { $first: '$orders.address' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: { cityIdString: { $in: splitRegion } },
                    },
                    {
                        $lookup: {
                            from: 'skus',
                            localField: 'orderItems.variantId',
                            foreignField: 'uid',
                            as: 'variant',
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'variant.productId',
                            foreignField: 'uid',
                            as: 'product',
                        },
                    },
                    {
                        $addFields: {
                            products: {
                                $map: {
                                    input: {
                                        $range: [0, { $size: '$variant' }],
                                    },
                                    as: 'index',
                                    in: {
                                        title: {
                                            $arrayElemAt: [
                                                '$product.title',
                                                '$$index',
                                            ],
                                        },
                                        image: {
                                            $first: {
                                                $arrayElemAt: [
                                                    '$product.images',
                                                    '$$index',
                                                ],
                                            },
                                        },
                                        price: {
                                            $arrayElemAt: [
                                                '$variant.purchasePrice',
                                                '$$index',
                                            ],
                                        },
                                        quantity: {
                                            $arrayElemAt: [
                                                '$orderItems.quantity',
                                                '$$index',
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            products: '$products',
                            price: {
                                $reduce: {
                                    input: '$products',
                                    initialValue: 0,
                                    in: {
                                        $add: [
                                            '$$value',
                                            {
                                                $multiply: [
                                                    '$$this.price',
                                                    '$$this.quantity',
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            uid: 1,
                            status: 1,
                            name: 1,
                            phone: 1,
                            city_id: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            extra_info: 1,
                        },
                    },
                    { $sort: { uid: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                ];

                const invoices = await InvoicesModel.aggregate(invoicesMatch);

                return {
                    invoices,
                    countPage: countPage[0]
                        ? Math.ceil(countPage[0]['Total'] / limit)
                        : 0,
                    size: countPage[0] ? countPage[0]['Total'] : 0,
                };
            } else {
                if (status) {
                    var countPageMatch: any[] = [
                        {
                            $addFields: {
                                numberStr: {
                                    $toString: '$uid',
                                },
                            },
                        },
                        {
                            $match: {
                                $or: [
                                    {
                                        name: {
                                            $regex: filter,
                                            $options: 'i',
                                        },
                                    },
                                    {
                                        phone: {
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
                                    {
                                        createdAt: {
                                            $gt: new Date(from),
                                            $lt: new Date(to),
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: 'orders',
                                localField: 'order_id',
                                foreignField: '_id',
                                as: 'orders',
                            },
                        },
                        {
                            $addFields: {
                                status: { $first: '$orders.status' },
                                name: '$name',
                                phone: '$phone',
                                uid: '$uid',
                                createdAt: '$createdAt',
                                updatedAt: '$updatedAt',
                                city_id: { $first: '$orders.city_id' },
                                extra_info: { $first: '$orders.extra_info' },
                                address: { $first: '$orders.address' },
                                orderItems: { $first: '$orders.orderItems' },
                                cityIdString: {
                                    $toString: { $first: '$orders.city_id' },
                                },
                            },
                        },
                        {
                            $match: {
                                status: {
                                    $regex: status,
                                    $options: 'i',
                                },
                                cityIdString: { $in: splitRegion },
                            },
                        },
                        {
                            $count: 'Total',
                        },
                    ];

                    const countPage = await InvoicesModel.aggregate(
                        countPageMatch
                    );

                    var invoicesMatch: any[] = [
                        {
                            $addFields: {
                                numberStr: {
                                    $toString: '$uid',
                                },
                            },
                        },
                        {
                            $match: {
                                $or: [
                                    {
                                        name: {
                                            $regex: filter,
                                            $options: 'i',
                                        },
                                    },
                                    {
                                        phone: {
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
                                    {
                                        createdAt: { $gt: from, $lt: to },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: 'orders',
                                localField: 'order_id',
                                foreignField: '_id',
                                as: 'orders',
                            },
                        },
                        {
                            $addFields: {
                                status: { $first: '$orders.status' },
                                name: '$name',
                                phone: '$phone',
                                uid: '$uid',
                                createdAt: '$createdAt',
                                updatedAt: '$updatedAt',
                                city_id: { $first: '$orders.city_id' },
                                extra_info: { $first: '$orders.extra_info' },
                                orderId: { $first: '$orders.number' },
                                address: { $first: '$orders.address' },
                                orderItems: { $first: '$orders.orderItems' },
                                cityIdString: {
                                    $toString: { $first: '$orders.city_id' },
                                },
                            },
                        },
                        {
                            $match: {
                                status: {
                                    $regex: status,
                                    $options: 'i',
                                },
                                cityIdString: { $in: splitRegion },
                            },
                        },
                        {
                            $lookup: {
                                from: 'skus',
                                localField: 'orderItems.variantId',
                                foreignField: 'uid',
                                as: 'variant',
                            },
                        },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'variant.productId',
                                foreignField: 'uid',
                                as: 'product',
                            },
                        },
                        {
                            $addFields: {
                                products: {
                                    $map: {
                                        input: {
                                            $range: [0, { $size: '$variant' }],
                                        },
                                        as: 'index',
                                        in: {
                                            title: {
                                                $arrayElemAt: [
                                                    '$product.title',
                                                    '$$index',
                                                ],
                                            },
                                            image: {
                                                $first: {
                                                    $arrayElemAt: [
                                                        '$product.images',
                                                        '$$index',
                                                    ],
                                                },
                                            },
                                            price: {
                                                $arrayElemAt: [
                                                    '$variant.purchasePrice',
                                                    '$$index',
                                                ],
                                            },
                                            quantity: {
                                                $arrayElemAt: [
                                                    '$orderItems.quantity',
                                                    '$$index',
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                products: '$products',
                                price: {
                                    $reduce: {
                                        input: '$products',
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                '$$value',
                                                {
                                                    $multiply: [
                                                        '$$this.price',
                                                        '$$this.quantity',
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                                uid: 1,
                                status: 1,
                                name: 1,
                                phone: 1,
                                city_id: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                extra_info: 1,
                                address: 1,
                                orderId: 1,
                            },
                        },
                        { $sort: { uid: -1 } },
                    ];

                    const invoices = await InvoicesModel.aggregate(
                        invoicesMatch
                    );

                    return {
                        invoices,
                        size: countPage[0] ? countPage[0]['Total'] : 0,
                    };
                }
                var countPageMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: { $gt: from, $lt: to },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            address: { $first: '$orders.address' },
                            orderItems: { $first: '$orders.orderItems' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: { cityIdString: { $in: splitRegion } },
                    },
                    {
                        $count: 'Total',
                    },
                ];

                const countPage = await InvoicesModel.aggregate(countPageMatch);

                var invoicesMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: { $gt: from, $lt: to },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            orderItems: { $first: '$orders.orderItems' },
                            address: { $first: '$orders.address' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: { cityIdString: { $in: splitRegion } },
                    },
                    {
                        $lookup: {
                            from: 'skus',
                            localField: 'orderItems.variantId',
                            foreignField: 'uid',
                            as: 'variant',
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'variant.productId',
                            foreignField: 'uid',
                            as: 'product',
                        },
                    },
                    {
                        $addFields: {
                            products: {
                                $map: {
                                    input: {
                                        $range: [0, { $size: '$variant' }],
                                    },
                                    as: 'index',
                                    in: {
                                        title: {
                                            $arrayElemAt: [
                                                '$product.title',
                                                '$$index',
                                            ],
                                        },
                                        image: {
                                            $first: {
                                                $arrayElemAt: [
                                                    '$product.images',
                                                    '$$index',
                                                ],
                                            },
                                        },
                                        price: {
                                            $arrayElemAt: [
                                                '$variant.purchasePrice',
                                                '$$index',
                                            ],
                                        },
                                        quantity: {
                                            $arrayElemAt: [
                                                '$orderItems.quantity',
                                                '$$index',
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            products: '$products',
                            price: {
                                $reduce: {
                                    input: '$products',
                                    initialValue: 0,
                                    in: {
                                        $add: [
                                            '$$value',
                                            {
                                                $multiply: [
                                                    '$$this.price',
                                                    '$$this.quantity',
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            uid: 1,
                            status: 1,
                            name: 1,
                            phone: 1,
                            city_id: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            extra_info: 1,
                        },
                    },
                    { $sort: { uid: -1 } },
                ];

                const invoices = await InvoicesModel.aggregate(invoicesMatch);

                return {
                    invoices,
                    size: countPage[0] ? countPage[0]['Total'] : 0,
                };
            }
        }

        if (limit && limit !== 10) {
            if (status) {
                var countPageMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: {
                                        $gt: new Date(from),
                                        $lt: new Date(to),
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            address: { $first: '$orders.address' },
                            orderItems: { $first: '$orders.orderItems' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: {
                            status: {
                                $regex: status,
                                $options: 'i',
                            },
                        },
                    },
                    {
                        $count: 'Total',
                    },
                ];

                const countPage = await InvoicesModel.aggregate(countPageMatch);

                var invoicesMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: { $gt: from, $lt: to },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            orderId: { $first: '$orders.number' },
                            address: { $first: '$orders.address' },
                            orderItems: { $first: '$orders.orderItems' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: {
                            status: {
                                $regex: status,
                                $options: 'i',
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'skus',
                            localField: 'orderItems.variantId',
                            foreignField: 'uid',
                            as: 'variant',
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'variant.productId',
                            foreignField: 'uid',
                            as: 'product',
                        },
                    },
                    {
                        $addFields: {
                            products: {
                                $map: {
                                    input: {
                                        $range: [0, { $size: '$variant' }],
                                    },
                                    as: 'index',
                                    in: {
                                        title: {
                                            $arrayElemAt: [
                                                '$product.title',
                                                '$$index',
                                            ],
                                        },
                                        image: {
                                            $first: {
                                                $arrayElemAt: [
                                                    '$product.images',
                                                    '$$index',
                                                ],
                                            },
                                        },
                                        price: {
                                            $arrayElemAt: [
                                                '$variant.purchasePrice',
                                                '$$index',
                                            ],
                                        },
                                        quantity: {
                                            $arrayElemAt: [
                                                '$orderItems.quantity',
                                                '$$index',
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            products: '$products',
                            price: {
                                $reduce: {
                                    input: '$products',
                                    initialValue: 0,
                                    in: {
                                        $add: [
                                            '$$value',
                                            {
                                                $multiply: [
                                                    '$$this.price',
                                                    '$$this.quantity',
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            uid: 1,
                            status: 1,
                            name: 1,
                            phone: 1,
                            city_id: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            extra_info: 1,
                            address: 1,
                            orderId: 1,
                        },
                    },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    { $sort: { uid: -1 } },
                ];

                const invoices = await InvoicesModel.aggregate(invoicesMatch);

                return {
                    invoices,
                    countPage: countPage[0]
                        ? Math.ceil(countPage[0]['Total'] / limit)
                        : 0,
                    size: countPage[0] ? countPage[0]['Total'] : 0,
                };
            }
            var countPageMatch: any[] = [
                {
                    $addFields: {
                        numberStr: {
                            $toString: '$uid',
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                name: {
                                    $regex: filter,
                                    $options: 'i',
                                },
                            },
                            {
                                phone: {
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
                            {
                                createdAt: { $gt: from, $lt: to },
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'orders',
                    },
                },
                {
                    $addFields: {
                        status: { $first: '$orders.status' },
                        name: '$name',
                        phone: '$phone',
                        uid: '$uid',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        city_id: { $first: '$orders.city_id' },
                        extra_info: { $first: '$orders.extra_info' },
                        address: { $first: '$orders.address' },
                        orderItems: { $first: '$orders.orderItems' },
                        cityIdString: {
                            $toString: { $first: '$orders.city_id' },
                        },
                    },
                },
                {
                    $count: 'Total',
                },
            ];

            const countPage = await InvoicesModel.aggregate(countPageMatch);

            var invoicesMatch: any[] = [
                {
                    $addFields: {
                        numberStr: {
                            $toString: '$uid',
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                name: {
                                    $regex: filter,
                                    $options: 'i',
                                },
                            },
                            {
                                phone: {
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
                            {
                                createdAt: { $gt: from, $lt: to },
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'orders',
                    },
                },
                {
                    $addFields: {
                        status: { $first: '$orders.status' },
                        name: '$name',
                        phone: '$phone',
                        uid: '$uid',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        city_id: { $first: '$orders.city_id' },
                        extra_info: { $first: '$orders.extra_info' },
                        orderItems: { $first: '$orders.orderItems' },
                        address: { $first: '$orders.address' },
                        cityIdString: {
                            $toString: { $first: '$orders.city_id' },
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variant',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variant.productId',
                        foreignField: 'uid',
                        as: 'product',
                    },
                },
                {
                    $addFields: {
                        products: {
                            $map: {
                                input: {
                                    $range: [0, { $size: '$variant' }],
                                },
                                as: 'index',
                                in: {
                                    title: {
                                        $arrayElemAt: [
                                            '$product.title',
                                            '$$index',
                                        ],
                                    },
                                    image: {
                                        $first: {
                                            $arrayElemAt: [
                                                '$product.images',
                                                '$$index',
                                            ],
                                        },
                                    },
                                    price: {
                                        $arrayElemAt: [
                                            '$variant.purchasePrice',
                                            '$$index',
                                        ],
                                    },
                                    quantity: {
                                        $arrayElemAt: [
                                            '$orderItems.quantity',
                                            '$$index',
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        products: '$products',
                        price: {
                            $reduce: {
                                input: '$products',
                                initialValue: 0,
                                in: {
                                    $add: [
                                        '$$value',
                                        {
                                            $multiply: [
                                                '$$this.price',
                                                '$$this.quantity',
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        uid: 1,
                        status: 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        extra_info: 1,
                    },
                },
                { $sort: { uid: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ];

            const invoices = await InvoicesModel.aggregate(invoicesMatch);

            return {
                invoices,
                countPage: countPage[0]
                    ? Math.ceil(countPage[0]['Total'] / limit)
                    : 0,
                size: countPage[0] ? countPage[0]['Total'] : 0,
            };
        } else {
            if (status) {
                var countPageMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: {
                                        $gt: new Date(from),
                                        $lt: new Date(to),
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            address: { $first: '$orders.address' },
                            orderItems: { $first: '$orders.orderItems' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: {
                            status: {
                                $regex: status,
                                $options: 'i',
                            },
                        },
                    },
                    {
                        $count: 'Total',
                    },
                ];

                const countPage = await InvoicesModel.aggregate(countPageMatch);

                var invoicesMatch: any[] = [
                    {
                        $addFields: {
                            numberStr: {
                                $toString: '$uid',
                            },
                        },
                    },
                    {
                        $match: {
                            $or: [
                                {
                                    name: {
                                        $regex: filter,
                                        $options: 'i',
                                    },
                                },
                                {
                                    phone: {
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
                                {
                                    createdAt: { $gt: from, $lt: to },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: 'orders',
                            localField: 'order_id',
                            foreignField: '_id',
                            as: 'orders',
                        },
                    },
                    {
                        $addFields: {
                            status: { $first: '$orders.status' },
                            name: '$name',
                            phone: '$phone',
                            uid: '$uid',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            city_id: { $first: '$orders.city_id' },
                            extra_info: { $first: '$orders.extra_info' },
                            orderId: { $first: '$orders.number' },
                            address: { $first: '$orders.address' },
                            orderItems: { $first: '$orders.orderItems' },
                            cityIdString: {
                                $toString: { $first: '$orders.city_id' },
                            },
                        },
                    },
                    {
                        $match: {
                            status: {
                                $regex: status,
                                $options: 'i',
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'skus',
                            localField: 'orderItems.variantId',
                            foreignField: 'uid',
                            as: 'variant',
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'variant.productId',
                            foreignField: 'uid',
                            as: 'product',
                        },
                    },
                    {
                        $addFields: {
                            products: {
                                $map: {
                                    input: {
                                        $range: [0, { $size: '$variant' }],
                                    },
                                    as: 'index',
                                    in: {
                                        title: {
                                            $arrayElemAt: [
                                                '$product.title',
                                                '$$index',
                                            ],
                                        },
                                        image: {
                                            $first: {
                                                $arrayElemAt: [
                                                    '$product.images',
                                                    '$$index',
                                                ],
                                            },
                                        },
                                        price: {
                                            $arrayElemAt: [
                                                '$variant.purchasePrice',
                                                '$$index',
                                            ],
                                        },
                                        quantity: {
                                            $arrayElemAt: [
                                                '$orderItems.quantity',
                                                '$$index',
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            products: '$products',
                            price: {
                                $reduce: {
                                    input: '$products',
                                    initialValue: 0,
                                    in: {
                                        $add: [
                                            '$$value',
                                            {
                                                $multiply: [
                                                    '$$this.price',
                                                    '$$this.quantity',
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                            uid: 1,
                            status: 1,
                            name: 1,
                            phone: 1,
                            city_id: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            extra_info: 1,
                            address: 1,
                            orderId: 1,
                        },
                    },
                    { $sort: { uid: -1 } },
                ];

                const invoices = await InvoicesModel.aggregate(invoicesMatch);

                return {
                    invoices,
                    size: countPage[0] ? countPage[0]['Total'] : 0,
                };
            }
            var countPageMatch: any[] = [
                {
                    $addFields: {
                        numberStr: {
                            $toString: '$uid',
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                name: {
                                    $regex: filter,
                                    $options: 'i',
                                },
                            },
                            {
                                phone: {
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
                            {
                                createdAt: { $gt: from, $lt: to },
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'orders',
                    },
                },
                {
                    $addFields: {
                        status: { $first: '$orders.status' },
                        name: '$name',
                        phone: '$phone',
                        uid: '$uid',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        city_id: { $first: '$orders.city_id' },
                        extra_info: { $first: '$orders.extra_info' },
                        address: { $first: '$orders.address' },
                        orderItems: { $first: '$orders.orderItems' },
                        cityIdString: {
                            $toString: { $first: '$orders.city_id' },
                        },
                    },
                },
                {
                    $count: 'Total',
                },
            ];

            const countPage = await InvoicesModel.aggregate(countPageMatch);

            var invoicesMatch: any[] = [
                {
                    $addFields: {
                        numberStr: {
                            $toString: '$uid',
                        },
                    },
                },
                {
                    $match: {
                        $or: [
                            {
                                name: {
                                    $regex: filter,
                                    $options: 'i',
                                },
                            },
                            {
                                phone: {
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
                            {
                                createdAt: { $gt: from, $lt: to },
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'orders',
                        localField: 'order_id',
                        foreignField: '_id',
                        as: 'orders',
                    },
                },
                {
                    $addFields: {
                        status: { $first: '$orders.status' },
                        name: '$name',
                        phone: '$phone',
                        uid: '$uid',
                        createdAt: '$createdAt',
                        updatedAt: '$updatedAt',
                        city_id: { $first: '$orders.city_id' },
                        extra_info: { $first: '$orders.extra_info' },
                        orderItems: { $first: '$orders.orderItems' },
                        address: { $first: '$orders.address' },
                        cityIdString: {
                            $toString: { $first: '$orders.city_id' },
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variant',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variant.productId',
                        foreignField: 'uid',
                        as: 'product',
                    },
                },
                {
                    $addFields: {
                        products: {
                            $map: {
                                input: {
                                    $range: [0, { $size: '$variant' }],
                                },
                                as: 'index',
                                in: {
                                    title: {
                                        $arrayElemAt: [
                                            '$product.title',
                                            '$$index',
                                        ],
                                    },
                                    image: {
                                        $first: {
                                            $arrayElemAt: [
                                                '$product.images',
                                                '$$index',
                                            ],
                                        },
                                    },
                                    price: {
                                        $arrayElemAt: [
                                            '$variant.purchasePrice',
                                            '$$index',
                                        ],
                                    },
                                    quantity: {
                                        $arrayElemAt: [
                                            '$orderItems.quantity',
                                            '$$index',
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        products: '$products',
                        price: {
                            $reduce: {
                                input: '$products',
                                initialValue: 0,
                                in: {
                                    $add: [
                                        '$$value',
                                        {
                                            $multiply: [
                                                '$$this.price',
                                                '$$this.quantity',
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        uid: 1,
                        status: 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        extra_info: 1,
                    },
                },
                { $sort: { uid: -1 } },
            ];

            const invoices = await InvoicesModel.aggregate(invoicesMatch);

            return {
                invoices,
                size: countPage[0] ? countPage[0]['Total'] : 0,
            };
        }
    }
}
