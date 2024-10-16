import { IOrder } from '../interface/order.interface';
import ErrorResponse from '../../shared/utils/errorResponse';
import { OrderModel } from '../model/order.model';
import { ProductModel } from '../../product/model/product.model';
import mongoose from 'mongoose';
import { UserModel } from '../../user/model/user.model';

export default class OrderDao {
    async create(orderData: IOrder) {
        let message;
        const order = new OrderModel(orderData);
        await order
            .save()
            .catch((err) => (message = err.message.split(': ')[2]));

        if (message) {
            throw new ErrorResponse(400, message);
        }

        return await order;
        // .populate({
        //     path: 'orderItems.productId',
        //     model: ProductModel,
        //     select: 'name price',
        // });
    }
    async totalBalance() {
        const orders = await OrderModel.find({ status: { $ne: 'canceled' } });
        let totalBalance:number=0;
        
        orders.forEach(order=>{
            totalBalance+=order.referal_price || 0
        })
        return [{balance:totalBalance}];
    }

    async getAll(userId: string, page: number, limit: number) {
        const countPage = await OrderModel.find({
            userId: userId,
        }).count();
        const orders = await OrderModel.aggregate([
            { $match: { userId: userId } },
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
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);
        return { orders, countPage: Math.ceil(countPage / limit) };
    }

    async getAllReady() {
        return await OrderModel.aggregate([
            { $match: { status: 'ready' } },
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
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
        ]);
    }

    async getByCity() {
        let data = [];
        for (let i = 1; i <= 14; i++) {
            let count = await OrderModel.find({ city_id: i }).count();
            data.push({ id: i, count });
        }
        data = data.sort((a, b) => b.count - a.count);
        return data;
    }

    async getAllReferalOrders(
        userId: string,
        page: number,
        limit: number,
        filter: string = ''
    ) {
        const countPage = await OrderModel.aggregate([
            {
                $addFields: {
                    numberStr: {
                        $toString: '$number',
                    },
                },
            },
            {
                $match: {
                    userId: userId,
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
                $project: {
                    name: 1,
                    phone: 1,
                    number: 1,
                    status: 1,
                },
            },
            { $count: 'Total' },
        ]);
        const orders = await OrderModel.aggregate([
            {
                $addFields: {
                    numberStr: {
                        $toString: '$number',
                    },
                },
            },
            {
                $match: {
                    userId: userId,
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
                $project: {
                    name: 1,
                    number: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    takenById: 1,
                },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ]);
        return {
            orders,
            countPage: countPage[0]
                ? Math.ceil(countPage[0]['Total'] / limit)
                : 0,
        };
    }

    async getProductsCategory(id: string) {
        const order = await OrderModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
        ]);

        return order[0];
    }

    async getOrderById(id: string) {
        return await OrderModel.findById(new mongoose.Types.ObjectId(id));
    }

    async getAllOrderStatusAdmin(
        status: string,
        page: number,
        limit: number,
        startTime?: Date,
        endTime?: Date,
        region?: string
    ) {
        if (startTime && endTime && region) {
            const countPage = await OrderModel.find({
                status,
                city_id: { $in: region.split(',').map((e) => +e) },
                $and: [
                    { createdAt: { $gt: new Date(startTime) } },
                    { createdAt: { $lt: new Date(endTime) } },
                ],
            }).count();
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        status,
                        city_id: { $in: region.split(',').map((e) => +e) },
                        $and: [
                            { createdAt: { $gt: new Date(startTime) } },
                            { createdAt: { $lt: new Date(endTime) } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variants',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variants.productId',
                        foreignField: 'uid',
                        as: 'products',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        orderItems: {
                            $map: {
                                input: '$orderItems',
                                as: 'orderItem',
                                in: {
                                    $mergeObjects: [
                                        '$$orderItem',
                                        {
                                            product: {
                                                $let: {
                                                    vars: {
                                                        variant: {
                                                            $first: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'variant',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$variant.uid',
                                                                            '$$orderItem.variantId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $let: {
                                                            vars: {
                                                                product: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: '$products',
                                                                            as: 'product',
                                                                            cond: {
                                                                                $eq: [
                                                                                    '$$product.uid',
                                                                                    '$$variant.productId',
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: {
                                                                title: '$$product.title',
                                                                image: {
                                                                    $arrayElemAt: [
                                                                        '$$product.images.image.540.high',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                        },
                                    ],
                                },
                            },
                        },
                        operator: { $first: '$operator' },
                    },
                },
                {
                    $project: {
                        number: 1,
                        'orderItems.quantity': 1,
                        'orderItems.price': 1,
                        'orderItems.product': 1,
                        'orderItems.position': 1, // Positionni projectda qaytaramiz
                        'operator.name': 1,
                        'operator.phone': 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        fullPrice: 1,
                        isTaken: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);
            

            return {
                orders,
                countPage: Math.ceil(countPage / limit),
                size: countPage,
            };
        }

        if (startTime && endTime) {
            const countPage = await OrderModel.find({
                status,
                $and: [
                    { createdAt: { $gt: new Date(startTime) } },
                    { createdAt: { $lt: new Date(endTime) } },
                ],
            }).count();
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        status,
                        $and: [
                            { createdAt: { $gt: new Date(startTime) } },
                            { createdAt: { $lt: new Date(endTime) } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variants',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variants.productId',
                        foreignField: 'uid',
                        as: 'products',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        orderItems: {
                            $map: {
                                input: '$orderItems',
                                as: 'orderItem',
                                in: {
                                    $mergeObjects: [
                                        '$$orderItem',
                                        {
                                            product: {
                                                $let: {
                                                    vars: {
                                                        variant: {
                                                            $first: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'variant',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$variant.uid',
                                                                            '$$orderItem.variantId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $let: {
                                                            vars: {
                                                                product: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: '$products',
                                                                            as: 'product',
                                                                            cond: {
                                                                                $eq: [
                                                                                    '$$product.uid',
                                                                                    '$$variant.productId',
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: {
                                                                title: '$$product.title',
                                                                image: {
                                                                    $arrayElemAt: [
                                                                        '$$product.images.image.540.high',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                        },
                                    ],
                                },
                            },
                        },
                        operator: { $first: '$operator' },
                    },
                },
                {
                    $project: {
                        number: 1,
                        'orderItems.quantity': 1,
                        'orderItems.price': 1,
                        'orderItems.product': 1,
                        'orderItems.position': 1, // Positionni projectda qaytaramiz
                        'operator.name': 1,
                        'operator.phone': 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        fullPrice: 1,
                        isTaken: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);
            

            return {
                orders,
                countPage: Math.ceil(countPage / limit),
                size: countPage,
            };
        }

        if (region) {
            const countPage = await OrderModel.find({
                status,
                city_id: { $in: region.split(',').map((e) => +e) },
            }).count();
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        status,
                        city_id: { $in: region.split(',').map((e) => +e) },
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variants',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variants.productId',
                        foreignField: 'uid',
                        as: 'products',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        orderItems: {
                            $map: {
                                input: '$orderItems',
                                as: 'orderItem',
                                in: {
                                    $mergeObjects: [
                                        '$$orderItem',
                                        {
                                            product: {
                                                $let: {
                                                    vars: {
                                                        variant: {
                                                            $first: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'variant',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$variant.uid',
                                                                            '$$orderItem.variantId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $let: {
                                                            vars: {
                                                                product: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: '$products',
                                                                            as: 'product',
                                                                            cond: {
                                                                                $eq: [
                                                                                    '$$product.uid',
                                                                                    '$$variant.productId',
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: {
                                                                title: '$$product.title',
                                                                image: {
                                                                    $arrayElemAt: [
                                                                        '$$product.images.image.540.high',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                        },
                                    ],
                                },
                            },
                        },
                        operator: { $first: '$operator' },
                    },
                },
                {
                    $project: {
                        number: 1,
                        'orderItems.quantity': 1,
                        'orderItems.price': 1,
                        'orderItems.product': 1,
                        'orderItems.position': 1, // Positionni projectda qaytaramiz
                        'operator.name': 1,
                        'operator.phone': 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        fullPrice: 1,
                        isTaken: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);
            

            return {
                orders,
                countPage: Math.ceil(countPage / limit),
                size: countPage,
            };
        }

        const countPage = await OrderModel.find({
            status,
        }).count();
        const orders = await OrderModel.aggregate([
            {
                $match: {
                    status
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'orderItems.variantId',
                    foreignField: 'uid',
                    as: 'variants',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'variants.productId',
                    foreignField: 'uid',
                    as: 'products',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
            {
                $addFields: {
                    orderItems: {
                        $map: {
                            input: '$orderItems',
                            as: 'orderItem',
                            in: {
                                $mergeObjects: [
                                    '$$orderItem',
                                    {
                                        product: {
                                            $let: {
                                                vars: {
                                                    variant: {
                                                        $first: {
                                                            $filter: {
                                                                input: '$variants',
                                                                as: 'variant',
                                                                cond: {
                                                                    $eq: [
                                                                        '$$variant.uid',
                                                                        '$$orderItem.variantId',
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: {
                                                    $let: {
                                                        vars: {
                                                            product: {
                                                                $first: {
                                                                    $filter: {
                                                                        input: '$products',
                                                                        as: 'product',
                                                                        cond: {
                                                                            $eq: [
                                                                                '$$product.uid',
                                                                                '$$variant.productId',
                                                                            ],
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        in: {
                                                            title: '$$product.title',
                                                            image: {
                                                                $arrayElemAt: [
                                                                    '$$product.images.image.540.high',
                                                                    0,
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    {
                                        position: '$$orderItem.position', // Position qo'shilmoqda
                                    },
                                ],
                            },
                        },
                    },
                    operator: { $first: '$operator' },
                },
            },
            {
                $project: {
                    number: 1,
                    'orderItems.quantity': 1,
                    'orderItems.price': 1,
                    'orderItems.product': 1,
                    'orderItems.position': 1,
                    'operator.name': 1,
                    'operator.phone': 1,
                    name: 1,
                    phone: 1,
                    city_id: 1,
                    fullPrice: 1,
                    isTaken: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);
        

        return {
            orders,
            countPage: Math.ceil(countPage / limit),
            size: countPage,
        };
    }

    async getAllOrderStatusSeller(
        status: string,
        page: number,
        limit: number,
        startTime?: Date,
        endTime?: Date,
        region?: string,
        sellerId?:string,
    ) {
        if(!sellerId){
            return [ ]
        }
        const sellerFilter = sellerId ? { seller: new mongoose.Types.ObjectId(sellerId) } : {};
        
        if (startTime && endTime && region) {
            const countPage = await OrderModel.find({
                ...sellerFilter,
                status,
                city_id: { $in: region.split(',').map((e) => +e) },
                $and: [
                    { createdAt: { $gt: new Date(startTime) } },
                    { createdAt: { $lt: new Date(endTime) } },
                ],
            }).count();
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        ...sellerFilter,
                        status,
                        city_id: { $in: region.split(',').map((e) => +e) },
                        $and: [
                            { createdAt: { $gt: new Date(startTime) } },
                            { createdAt: { $lt: new Date(endTime) } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variants',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variants.productId',
                        foreignField: 'uid',
                        as: 'products',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        orderItems: {
                            $map: {
                                input: '$orderItems',
                                as: 'orderItem',
                                in: {
                                    $mergeObjects: [
                                        '$$orderItem',
                                        {
                                            product: {
                                                $let: {
                                                    vars: {
                                                        variant: {
                                                            $first: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'variant',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$variant.uid',
                                                                            '$$orderItem.variantId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $let: {
                                                            vars: {
                                                                product: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: '$products',
                                                                            as: 'product',
                                                                            cond: {
                                                                                $eq: [
                                                                                    '$$product.uid',
                                                                                    '$$variant.productId',
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: {
                                                                title: '$$product.title',
                                                                image: {
                                                                    $arrayElemAt: [
                                                                        '$$product.images.image.540.high',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                        },
                                    ],
                                },
                            },
                        },
                        operator: { $first: '$operator' },
                    },
                },
                {
                    $project: {
                        number: 1,
                        'orderItems.quantity': 1,
                        'orderItems.price': 1,
                        'orderItems.product': 1,
                        'orderItems.position': 1, // Positionni projectda qaytaramiz
                        'operator.name': 1,
                        'operator.phone': 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        fullPrice: 1,
                        isTaken: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);

            return {
                orders,
                countPage: Math.ceil(countPage / limit),
                size: countPage,
            };
        }

        if (startTime && endTime) {
            const countPage = await OrderModel.find({
                ...sellerFilter,
                status,
                $and: [
                    { createdAt: { $gt: new Date(startTime) } },
                    { createdAt: { $lt: new Date(endTime) } },
                ],
            }).count();
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        ...sellerFilter,
                        status,
                        $and: [
                            { createdAt: { $gt: new Date(startTime) } },
                            { createdAt: { $lt: new Date(endTime) } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variants',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variants.productId',
                        foreignField: 'uid',
                        as: 'products',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        orderItems: {
                            $map: {
                                input: '$orderItems',
                                as: 'orderItem',
                                in: {
                                    $mergeObjects: [
                                        '$$orderItem',
                                        {
                                            product: {
                                                $let: {
                                                    vars: {
                                                        variant: {
                                                            $first: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'variant',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$variant.uid',
                                                                            '$$orderItem.variantId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $let: {
                                                            vars: {
                                                                product: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: '$products',
                                                                            as: 'product',
                                                                            cond: {
                                                                                $eq: [
                                                                                    '$$product.uid',
                                                                                    '$$variant.productId',
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: {
                                                                title: '$$product.title',
                                                                image: {
                                                                    $arrayElemAt: [
                                                                        '$$product.images.image.540.high',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                        },
                                    ],
                                },
                            },
                        },
                        operator: { $first: '$operator' },
                    },
                },
                {
                    $project: {
                        number: 1,
                        'orderItems.quantity': 1,
                        'orderItems.price': 1,
                        'orderItems.product': 1,
                        'orderItems.position': 1, // Positionni projectda qaytaramiz
                        'operator.name': 1,
                        'operator.phone': 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        fullPrice: 1,
                        isTaken: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);

            return {
                orders,
                countPage: Math.ceil(countPage / limit),
                size: countPage,
            };
        }

        if (region) {
            const countPage = await OrderModel.find({
                ...sellerFilter,
                status,
                city_id: { $in: region.split(',').map((e) => +e) },
            }).count();
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        ...sellerFilter,
                        status,
                        city_id: { $in: region.split(',').map((e) => +e) },
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'orderItems.variantId',
                        foreignField: 'uid',
                        as: 'variants',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'variants.productId',
                        foreignField: 'uid',
                        as: 'products',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        orderItems: {
                            $map: {
                                input: '$orderItems',
                                as: 'orderItem',
                                in: {
                                    $mergeObjects: [
                                        '$$orderItem',
                                        {
                                            product: {
                                                $let: {
                                                    vars: {
                                                        variant: {
                                                            $first: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'variant',
                                                                    cond: {
                                                                        $eq: [
                                                                            '$$variant.uid',
                                                                            '$$orderItem.variantId',
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    in: {
                                                        $let: {
                                                            vars: {
                                                                product: {
                                                                    $first: {
                                                                        $filter: {
                                                                            input: '$products',
                                                                            as: 'product',
                                                                            cond: {
                                                                                $eq: [
                                                                                    '$$product.uid',
                                                                                    '$$variant.productId',
                                                                                ],
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            in: {
                                                                title: '$$product.title',
                                                                image: {
                                                                    $arrayElemAt: [
                                                                        '$$product.images.image.540.high',
                                                                        0,
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                        },
                                    ],
                                },
                            },
                        },
                        operator: { $first: '$operator' },
                    },
                },
                {
                    $project: {
                        number: 1,
                        'orderItems.quantity': 1,
                        'orderItems.price': 1,
                        'orderItems.product': 1,
                        'orderItems.position': 1, // Positionni projectda qaytaramiz
                        'operator.name': 1,
                        'operator.phone': 1,
                        name: 1,
                        phone: 1,
                        city_id: 1,
                        fullPrice: 1,
                        isTaken: 1,
                        createdAt: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);

            return {
                orders,
                countPage: Math.ceil(countPage / limit),
                size: countPage,
            };
        }

        const countPage = await OrderModel.find({
            ...sellerFilter,
            status,
        }).count();
        const orders = await OrderModel.aggregate([
            {
                $match: {
                    ...sellerFilter,
                    status,
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'orderItems.variantId',
                    foreignField: 'uid',
                    as: 'variants',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'variants.productId',
                    foreignField: 'uid',
                    as: 'products',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
            {
                $addFields: {
                    orderItems: {
                        $map: {
                            input: '$orderItems',
                            as: 'orderItem',
                            in: {
                                $mergeObjects: [
                                    '$$orderItem',
                                    {
                                        product: {
                                            $let: {
                                                vars: {
                                                    variant: {
                                                        $first: {
                                                            $filter: {
                                                                input: '$variants',
                                                                as: 'variant',
                                                                cond: {
                                                                    $eq: [
                                                                        '$$variant.uid',
                                                                        '$$orderItem.variantId',
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: {
                                                    $let: {
                                                        vars: {
                                                            product: {
                                                                $first: {
                                                                    $filter: {
                                                                        input: '$products',
                                                                        as: 'product',
                                                                        cond: {
                                                                            $eq: [
                                                                                '$$product.uid',
                                                                                '$$variant.productId',
                                                                            ],
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        in: {
                                                            title: '$$product.title',
                                                            image: {
                                                                $arrayElemAt: [
                                                                    '$$product.images.image.540.high',
                                                                    0,
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    {
                                        position: '$$orderItem.position', // Position qo'shilmoqda
                                    },
                                ],
                            },
                        },
                    },
                    operator: { $first: '$operator' },
                },
            },
            {
                $project: {
                    number: 1,
                    'orderItems.quantity': 1,
                    'orderItems.price': 1,
                    'orderItems.product': 1,
                    'orderItems.position': 1, // Positionni projectda qaytaramiz
                    'operator.name': 1,
                    'operator.phone': 1,
                    name: 1,
                    phone: 1,
                    city_id: 1,
                    fullPrice: 1,
                    isTaken: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);

        return {
            orders,
            countPage: Math.ceil(countPage / limit),
            size: countPage,
        };
    }

    async updateOrderStatusAdmin(
        status: string,
        startTime?: Date,
        endTime?: Date,
        region?: string
    ) {
        let query: any = { status };

        if (region) {
            let numbers = region?.split(',')?.map((e) => +e);

            query.city_id = { $in: numbers };
        }
        if (startTime && endTime) {
            query.createdAt = { $gt: startTime, $lt: endTime };
        }

        const orders = await OrderModel.find(query).select('_id');

        return orders;
    }

    async getOneOrder(id: string) {
        const order = await OrderModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'orderItems.variantId',
                    foreignField: 'uid',
                    as: 'variants',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'variants.productId',
                    foreignField: 'uid',
                    as: 'products',
                },
            },
            {
                $lookup: {
                    from: 'subfeatures',
                    localField: 'products.characteristics.values.uid',
                    foreignField: 'uid',
                    as: 'features',
                },
            },
            {
                $lookup: {
                    from: 'features',
                    localField: 'products.characteristics.uid',
                    foreignField: 'uid',
                    as: 'characteristics',
                },
            },
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
                    foreignField: '_id',
                    as: 'stream',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stream.user',
                    foreignField: '_id',
                    as: 'streamHolder',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
            {
                $addFields: {
                    operator: { $first: '$operator' },
                    streamHolder: { $first: '$streamHolder' },
                    orderItems: {
                        $map: {
                            input: '$orderItems',
                            as: 'orderItem',
                            in: {
                                $mergeObjects: [
                                    '$$orderItem',
                                    {
                                        product: {
                                            $let: {
                                                vars: {
                                                    variant: {
                                                        $first: {
                                                            $filter: {
                                                                input: '$variants',
                                                                as: 'variant',
                                                                cond: {
                                                                    $eq: ['$$variant.uid', '$$orderItem.variantId'],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: {
                                                    $let: {
                                                        vars: {
                                                            product: {
                                                                $first: {
                                                                    $filter: {
                                                                        input: '$products',
                                                                        as: 'product',
                                                                        cond: {
                                                                            $eq: ['$$product.uid', '$$variant.productId'],
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                            skuList: {
                                                                $filter: {
                                                                    input: '$variants',
                                                                    as: 'sku',
                                                                    cond: {
                                                                        $eq: ['$$sku.productId', '$$variant.productId'],
                                                                    },
                                                                },
                                                            },
                                                        },
                                                        in: {
                                                            title: '$$product.title',
                                                            image: {
                                                                $arrayElemAt: ['$$product.images.image.540.high', 0],
                                                            },
                                                            skuList: '$$skuList',
                                                            characteristics: {
                                                                $let: {
                                                                    vars: {
                                                                        characteristics: {
                                                                            $filter: {
                                                                                input: '$characteristics',
                                                                                as: 'character',
                                                                                cond: {
                                                                                    $in: ['$$character.uid', '$$product.characteristics.uid'],
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                    in: {
                                                                        $map: {
                                                                            input: '$$characteristics',
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
                                                                                                    $eq: ['$$value.charId', '$$character.uid'],
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
                                                            position: '$$orderItem.position', // Position qo'shilmoqda
                                                        },
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
            },
            {
                $project: {
                    variants: 0,
                    products: 0,
                    features: 0,
                    characteristics: 0,
                    stream: 0,
                },
            },
        ]);

        return order[0];
    }

    async getOperatorOrders(
        userId: string,
        status?: string,
        page?: number,
        limit?: number
    ) {
        if (status) {
            const countPage = await OrderModel.aggregate([
                {
                    $match: {
                        takenById: new mongoose.Types.ObjectId(userId),
                        status: status,
                    },
                },
                {
                    $count: 'Total',
                },
            ]);
            const orders = await OrderModel.aggregate([
                {
                    $match: {
                        takenById: new mongoose.Types.ObjectId(userId),
                        status: status,
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        operator: '$operator.name',
                    },
                },
                {
                    $unwind: {
                        path: '$operator',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        name: 1,
                        number: 1,
                        address: 1,
                        status: 1,
                        operator: 1,
                        createdAt: 1,
                        referal_price: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                {
                    $skip: (page - 1) * limit,
                },
                {
                    $limit: limit,
                },
            ]);
            return {
                orders,
                countPage: countPage[0]
                    ? Math.ceil(countPage[0]['Total'] / 10)
                    : 0,
                size: countPage[0] ? countPage[0]['Total'] : 0,
            };
        }
        const countPage = await OrderModel.aggregate([
            {
                $match: {
                    takenById: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $count: 'Total',
            },
        ]);
        const orders = await OrderModel.aggregate([
            {
                $match: {
                    takenById: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
            {
                $addFields: {
                    operator: '$operator.name',
                },
            },
            {
                $unwind: {
                    path: '$operator',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: 1,
                    number: 1,
                    address: 1,
                    status: 1,
                    operator: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
        return {
            orders,
            countPage: countPage[0] ? Math.ceil(countPage[0]['Total'] / 10) : 0,
            size: countPage[0] ? countPage[0]['Total'] : 0,
        };
    }
// hsjjsjskjs
async getOperatorOrderProduct(operatorId: string, status: string) {
    const matchStage: mongoose.PipelineStage.Match = {
        $match: {
            takenById: new mongoose.Types.ObjectId(operatorId),
            ...(status ? { status } : {}), // Only add status if it is provided
        },
    };

    // Create the base pipeline
    const pipeline: mongoose.PipelineStage[] = [
        {
            $unwind: {
                path: '$orderItems',
                preserveNullAndEmptyArrays: true, // This keeps the order if there are no order items
            },
        },
        matchStage,
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
            $unwind: {
                path: '$product',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                name: 1,
                productTitle: '$product.title',
                position: '$orderItems.position', // Extracting position from orderItems
                number: 1,
                city_id: 1,
                image: { $first: '$product.images' },
                status: 1,
                takenById: 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ];

    return await OrderModel.aggregate(pipeline);
}


    

    async getOperatorOrderProductCount(operatorId: string) {
        var arr = [];
        let newC = await OrderModel.find({
            takenById: operatorId,
            status: 'new',
        }).count();
        arr.push({
            label: 'Yangi',
            status: 'new',
            count: newC,
        });
        let onwayC = await OrderModel.find({
            takenById: operatorId,
            status: 'onway',
        }).count();
        arr.push({
            label: `Yo'lda`,
            status: 'onway',
            count: onwayC,
        });
        let deliveredC = await OrderModel.find({
            takenById: operatorId,
            status: 'delivered',
        }).count();
        arr.push({
            label: `Yetkazilgan`,
            status: 'delivered',
            count: deliveredC,
        });
        let canceledC = await OrderModel.find({
            takenById: operatorId,
            status: 'canceled',
        }).count();
        arr.push({
            label: `Bekor qilingan`,
            status: 'canceled',
            count: canceledC,
        });
        let pendingC = await OrderModel.find({
            takenById: operatorId,
            status: 'pending',
        }).count();
        arr.push({
            label: `Keyin oladi`,
            status: 'pending',
            count: pendingC,
        });
        let readyC = await OrderModel.find({
            takenById: operatorId,
            status: 'ready',
        }).count();
        arr.push({
            label: `Tayyor`,
            status: 'ready',
            count: readyC,
        });
        let holdC = await OrderModel.find({
            takenById: operatorId,
            status: 'hold',
        }).count();
        arr.push({
            label: `Hold`,
            status: 'hold',
            count: holdC,
        });
        let archivedC = await OrderModel.find({
            takenById: operatorId,
            status: 'archived',
        }).count();
        arr.push({
            label: `Arxivlangan`,
            status: 'archived',
            count: archivedC,
        });
        return arr;
    }

    async getUserOrders(
        userId: string,
        status?: string,
        page?: number,
        limit?: number
    ) {
        if (status) {
            const countPage = await OrderModel.aggregate([
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'streamId',
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
                    $lookup: {
                        from: 'products',
                        localField: 'streams.product',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                {
                    $addFields: {
                        id: '$users._id',
                        product: '$product.name',
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
                        path: '$product',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        id: { $first: '$id' },
                        streamId: 1,
                        name: 1,
                        status: 1,
                        prevStatus: 1,
                        takenById: 1,
                        product: 1,
                    },
                },
                {
                    $match: {
                        id: new mongoose.Types.ObjectId(userId),
                        status: status,
                    },
                },
                {
                    $count: 'Total',
                },
            ]);
            const orders = await OrderModel.aggregate([
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'streamId',
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
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'streams.product',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                {
                    $addFields: {
                        id: '$users._id',
                        product: '$product.name',
                        operator: '$operator.name',
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
                        path: '$product',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        id: { $first: '$id' },
                        streamId: 1,
                        name: 1,
                        status: 1,
                        prevStatus: 1,
                        takenById: 1,
                        product: 1,
                        number: 1,
                        address: 1,
                        createdAt: 1,
                        isTaken: 1,
                        operator: { $first: '$operator' },
                        referal_price: 1,
                    },
                },
                {
                    $match: {
                        id: new mongoose.Types.ObjectId(userId),
                        status: status,
                    },
                },
                { $sort: { createdAt: -1 } },
                {
                    $skip: (page - 1) * limit,
                },
                {
                    $limit: limit,
                },
            ]);
            return {
                orders,
                countPage: countPage[0]
                    ? Math.ceil(countPage[0]['Total'] / limit)
                    : 0,
                size: countPage[0] ? countPage[0]['Total'] : 0,
            };
        }
        const countPage = await OrderModel.aggregate([
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
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
                $lookup: {
                    from: 'products',
                    localField: 'streams.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            {
                $addFields: {
                    id: '$users._id',
                    product: '$product.name',
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
                    path: '$product',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    id: { $first: '$id' },
                    streamId: 1,
                    name: 1,
                    status: 1,
                    prevStatus: 1,
                    takenById: 1,
                    product: 1,
                },
            },
            {
                $match: {
                    id: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $count: 'Total',
            },
        ]);
        const orders = await OrderModel.aggregate([
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
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
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'streams.product',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            {
                $addFields: {
                    id: '$users._id',
                    product: '$product.name',
                    operator: '$operator.name',
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
                    path: '$product',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    id: { $first: '$id' },
                    streamId: 1,
                    name: 1,
                    status: 1,
                    prevStatus: 1,
                    takenById: 1,
                    product: 1,
                    number: 1,
                    address: 1,
                    createdAt: 1,
                    isTaken: 1,
                    operator: { $first: '$operator' },
                },
            },
            {
                $match: {
                    id: new mongoose.Types.ObjectId(userId),
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
        return {
            orders,
            countPage: countPage[0] ? Math.ceil(countPage[0]['Total'] / 10) : 0,
            size: countPage[0] ? countPage[0]['Total'] : 0,
        };
    }

    async getWeekOrders(nowDate: Date, lastDate: Date) {
        return await OrderModel.find({
            createdAt: { $gt: lastDate, $lt: nowDate },
        }).count();
    }

    async getOrderSlice(nowDate: Date, lastDate: Date, userId?: string) {
        if (userId) {
            return await OrderModel.aggregate([
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'streamId',
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
                        id: '$users._id',
                    },
                },
                {
                    $unwind: {
                        path: '$id',
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
                        id: userId,
                        createdAt: { $gte: lastDate, $lt: nowDate },
                    },
                },
                { $sort: { createdAt: -1 } },
            ]);
        } else {
            return await OrderModel.aggregate([
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'streamId',
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
                        id: '$users._id',
                    },
                },
                {
                    $unwind: {
                        path: '$id',
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
                        createdAt: { $gte: lastDate, $lt: nowDate },
                    },
                },
                { $sort: { createdAt: -1 } },
            ]);
        }
    }

    async findByIdAndUpdate(id: string, status: string, type: boolean) {
        return await OrderModel.findByIdAndUpdate(
            id,
            { status: status },
            { new: type }
        );
    }

    async getOrderProduct(orderId: string) {
        const order = await OrderModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
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
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
                    foreignField: '_id',
                    as: 'stream',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stream.user',
                    foreignField: '_id',
                    as: 'streamHolder',
                },
            },
            {
                $addFields: {
                    streamHolder: { $first: '$streamHolder' },
                    referalPrice: { $first: '$variant.referalPrice' },
                    adminPrice: '$referalPrice',
                },
            },
        ]);

        return order[0];
    }

    async getOrderWithName(userId?: string) {
        if (!userId) {
            return await OrderModel.find().populate('streamId', 'user');
        }
        return await OrderModel.aggregate([
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
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
                    id: '$users._id',
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
                    status: 1,
                    id: { $first: '$id' },
                    isDeleted: { $first: '$streams.isDeleted' },
                },
            },
            {
                $match: {
                    id: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
    }

    async getSumOfSoldProducts() {
        return await OrderModel.aggregate([
            {
                $match: {
                    status: 'delivered',
                },
            },
            {
                $addFields: {
                    orderItems: '$orderItems',
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
                    as: 'products',
                },
            },
            {
                $addFields: {
                    price: '$variant.purchasePrice',
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
                    price: { $sum: '$price' },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    sumOfSoldProducts: { $add: ['$total'] },
                },
            },
        ]);
    }

    async getProfitValue() {
        const sumOfSoldProducts = await OrderModel.aggregate([
            {
                $match: {
                    status: 'delivered',
                },
            },
            {
                $addFields: {
                    orderItems: '$orderItems',
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
                $addFields: {
                    price: '$variant.purchasePrice',
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
                    price: { $sum: '$price' },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    sumOfSoldProducts: { $add: ['$total'] },
                },
            },
        ]);

        const sumOfSoldProductsBoughtPrice = await OrderModel.aggregate([
            {
                $match: {
                    status: 'delivered',
                },
            },
            {
                $addFields: {
                    orderItems: '$orderItems',
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
                $addFields: {
                    price: '$variant.bought_price',
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
                    price: { $sum: '$price' },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$price',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    sumOfSoldProductsBoughtPrice: { $add: ['$total'] },
                },
            },
        ]);

        return {
            profit:
                sumOfSoldProducts[0]['sumOfSoldProducts'] -
                sumOfSoldProductsBoughtPrice[0]['sumOfSoldProductsBoughtPrice'],
        };
    }

    async getOpreatorOrders(userId: string) {
        return await OrderModel.aggregate([
            {
                $match: {
                    takenById: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $project: {
                    status: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
    }

    async getAllByStatus(status: string, isTaken: boolean = false) {
        return await OrderModel.aggregate([
            {
                $match: {
                    status,
                    isTaken,
                },
            },
            {
                $unwind: {
                    path: '$orderItems',
                    preserveNullAndEmptyArrays: true, // This keeps the order if there are no order items
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
                    productTitle: {
                        $first: '$product.title',
                    },
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
                    name: 1,
                    productTitle: 1,
                    position: '$orderItems.position', // Accessing position directly
                    number: 1,
                    city_id: 1,
                    image: { $first: '$product.images' },
                    status: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
    }
    
    

    async getWithNumber(operatorId: string, number: number) {
        const order = await OrderModel.aggregate([
            { $match: { takenById: operatorId, number } },
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
        ]);

        return order[0];
    }

    async getOneOperatorOrder(operatorId: string, orderId: string) {
        const order = await OrderModel.aggregate([
            {
                $match: {
                    takenById: operatorId,
                    _id: new mongoose.Types.ObjectId(orderId),
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
        ]);

        return order[0];
    }

    async getOneOperatorOrderMobile(operatorId: string, orderId: string) {
        const orderItems = await OrderModel.aggregate([
            {
                $match: {
                    takenById: new mongoose.Types.ObjectId(operatorId),
                    _id: new mongoose.Types.ObjectId(orderId),
                },
            },
            { $unwind: '$orderItems' },
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
                $group: {
                    _id: '$_id',
                    orderItems: {
                        $push: {
                            title: { $first: '$product.title' },
                            price: { $first: '$variant.purchasePrice' },
                            variantId: { $first: '$variant.uid' },
                            productId: { $first: '$product.uid' },
                            quantity: '$orderItems.quantity',
                            image: { $first: { $first: '$product.images' } },
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        const values = await OrderModel.aggregate([
            {
                $match: {
                    takenById: new mongoose.Types.ObjectId(operatorId),
                    _id: new mongoose.Types.ObjectId(orderId),
                },
            },
            {
                $project: {
                    name: 1,
                    number: 1,
                    city_id: 1,
                    status: 1,
                    createdAt: 1,
                    address: 1,
                    phone: 1,
                    message: 1,
                    extra_info: 1,
                    note: 1,
                    streamId: 1,
                    _id: 0,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
        return { ...orderItems[0], ...values[0] };
    }

    async searchOrderOperator(operatorId: string, filter: string) {
        return await OrderModel.aggregate([
            {
                $addFields: {
                    numberStr: {
                        $toString: '$number',
                    },
                    orderItems: { $first: '$orderItems' },
                },
            },
            {
                $match: {
                    takenById: operatorId,
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
                        {
                            phone: {
                                $regex: filter,
                                $options: 'i',
                            },
                        },
                    ],
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
                    producttitle: {
                        $first: '$product.title',
                    },
                    image: {
                        $first: '$product.images',
                    },
                },
            },
            {
                $unwind: {
                    path: '$productTitle',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$image',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: 1,
                    productTitle: 1,
                    number: 1,
                    city_id: 1,
                    image: 1,
                    status: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);
    }

    async updateOrder(id: string, values: IOrder) {
        return await OrderModel.findByIdAndUpdate(id, values, { new: true });
    }

    async deleteOrder(id: string) {
        await OrderModel.findByIdAndDelete(id);
    }

    async getAllSearchOrder(filter: string = '') {
        const orders = await OrderModel.aggregate([
            {
                $addFields: {
                    numberStr: {
                        $toString: '$number',
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
                    ],
                },
            },
            {
                $project: {
                    name: 1,
                    phone: 1,
                    number: 1,
                    status: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 20 },
        ]);

        return orders;
    }

    async getRegionCountOrder(id: number) {
        return await OrderModel.find({ city_id: id }).count();
    }

    async findByStreamId(streamId: string, page?: number, limit?: number) {
        const countPage = await OrderModel.find({ streamId: streamId })
            .populate({
                path: 'takenById',
                select: 'name phone',
            })
            .count();

        const orders = await OrderModel.find({ streamId: streamId })
            .populate({
                path: 'takenById',
                select: 'name phone',
            })
            .select(
                'takenById isTaken status name city_id number phone createdAt message'
            )
            .limit(limit)
            .skip((page - 1) * limit);

        return { orders, countPage: Math.ceil(countPage / limit) };
    }

    async findByStreamOrders(
        userId: string,
        status: string,
        page: number,
        limit: number,
        number?: any
    ) {
        if (status) {
            const countPage = await OrderModel.aggregate([
                { $match: { status } },
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'streamId',
                        foreignField: '_id',
                        as: 'stream',
                    },
                },
                { $match: { 'stream.isDeleted': false } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'stream.user',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $addFields: {
                        user: { $first: '$user' },
                    },
                },
                { $match: { 'user._id': new mongoose.Types.ObjectId(userId) } },
                { $count: 'Total' },
            ]);

            const orders = await OrderModel.aggregate([
                { $match: { status } },
                {
                    $lookup: {
                        from: 'streams',
                        localField: 'streamId',
                        foreignField: '_id',
                        as: 'stream',
                    },
                },
                { $match: { 'stream.isDeleted': false } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'stream.user',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'takenById',
                        foreignField: '_id',
                        as: 'operator',
                    },
                },
                {
                    $addFields: {
                        user: { $first: '$user' },
                        operator: { $first: '$operator' },
                    },
                },
                { $match: { 'user._id': new mongoose.Types.ObjectId(userId) } },
                {
                    $project: {
                        'operator.name': 1,
                        'operator.phone': 1,
                        isTaken: 1,
                        status: 1,
                        name: 1,
                        city_id: 1,
                        number: 1,
                        phone: 1,
                        createdAt: 1,
                        message: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);

            return {
                orders,
                countPage: countPage[0]
                    ? Math.ceil(countPage[0]['Total'] / limit)
                    : 0,
            };
        }

        var countPagematch: any[] = [
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
                    foreignField: '_id',
                    as: 'stream',
                },
            },
            { $match: { 'stream.isDeleted': false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stream.user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $addFields: {
                    user: { $first: '$user' },
                },
            },
            { $match: { 'user._id': new mongoose.Types.ObjectId(userId) } },
            { $count: 'Total' },
        ];
        var ordersmatch: any[] = [
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
                    foreignField: '_id',
                    as: 'stream',
                },
            },
            { $match: { 'stream.isDeleted': false } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stream.user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'takenById',
                    foreignField: '_id',
                    as: 'operator',
                },
            },
            {
                $addFields: {
                    user: { $first: '$user' },
                    operator: { $first: '$operator' },
                },
            },
            { $match: { 'user._id': new mongoose.Types.ObjectId(userId) } },
            {
                $project: {
                    'operator.name': 1,
                    'operator.phone': 1,
                    isTaken: 1,
                    status: 1,
                    name: 1,
                    city_id: 1,
                    number: 1,
                    phone: 1,
                    createdAt: 1,
                    message: 1,
                },
            },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ];
        if (number) {
            countPagematch.unshift({
                $match: { number: !isNaN(number) ? +number : null },
            });
            ordersmatch.unshift({
                $match: { number: !isNaN(number) ? +number : null },
            });
        }
        const countPage = await OrderModel.aggregate(countPagematch);
        const orders = await OrderModel.aggregate(ordersmatch);

        return {
            orders,
            countPage: countPage[0]
                ? Math.ceil(countPage[0]['Total'] / limit)
                : 0,
        };
    }

    async getProductsDelivered() {
        return await OrderModel.aggregate([
            {
                $match: {
                    status: 'delivered',
                },
            },
            {
                $unwind: {
                    path: '$orderItems',
                },
            },
            {
                $group: {
                    _id: '$orderItems.variantId',
                    total: {
                        $sum: '$orderItems.quantity',
                    },
                },
            },
            {
                $sort: { total: -1 },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: '_id',
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
                $unwind: {
                    path: '$product',
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
                $unwind: {
                    path: '$category',
                },
            },
            {
                $project: {
                    total: 1,
                    _id: 0,
                    'product.uid': 1,
                    'product.ttile': 1,
                    'product.images': 1,
                    'variant.purchasePrice': 1,
                    'product.blocked': 1,
                    'variant.referalPrice': 1,
                    'variant.availableAmount': 1,
                    'variant.quantitySold': 1,
                    'category.title': 1,
                    'category.uid': 1,
                },
            },
            { $sort: { total: -1 } },
            {
                $limit: 10,
            },
        ]);
    }

    async getUsersForCompetition(startTime: Date, endTime: Date) {
        return await OrderModel.aggregate([
            {
                $match: {
                    status: 'delivered',
                    createdAt: {
                        $gt: startTime,
                        $lt: endTime,
                    },
                },
            },
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
                    foreignField: '_id',
                    as: 'stream',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stream.user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                },
            },
            {
                $unwind: {
                    path: '$stream',
                },
            },

            {
                $group: {
                    phone: {
                        $first: {
                            $concat: [
                                { $substr: ['$user.phone', 0, 6] },
                                '***',
                                { $substr: ['$user.phone', 8, 4] },
                            ],
                        },
                    },
                    name: { $first: '$user.name' },
                    avatar: { $first: '$user.avatar' },

                    _id: '$user._id',
                    soldOrderCount: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    soldOrderCount: -1,
                },
            },
        ]);
    }

    async getBestSellers() {
        return await OrderModel.aggregate([
            {
                $match: {
                    status: 'delivered',
                },
            },
            {
                $lookup: {
                    from: 'streams',
                    localField: 'streamId',
                    foreignField: '_id',
                    as: 'stream',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'stream.user',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: {
                    path: '$user',
                },
            },
            {
                $unwind: {
                    path: '$stream',
                },
            },
            {
                $group: {
                    name: {
                        $first: '$user.name',
                    },
                    createdAt: {
                        $first: '$user.createdAt',
                    },
                    _id: '$user._id',
                    soldOrderCount: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    soldOrderCount: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);
    }

    async getOrdersIdWithStatus(status: string) {
        return await OrderModel.aggregate([
            {
                $match: {
                    status,
                },
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);
    }

    async findOrdersLast24HoursByUserIp(ip: string) {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const foundOrdersCount = await OrderModel.find({
            user_ip: ip,
            createdAt: { $gte: twentyFourHoursAgo },
        }).count();

        return foundOrdersCount;
    }

    async operatorNewOrdersLastFiveMinutes(operatorId: string) {
        const orders = await OrderModel.find({
            takenById: new mongoose.Types.ObjectId(operatorId),
            status: 'new',
            updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
        });

        return orders.length > 5 ? false : true;
    }
}
