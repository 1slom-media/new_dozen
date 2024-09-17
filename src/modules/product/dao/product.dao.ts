import mongoose from 'mongoose';
import { UpdateProductDto } from '../dto/product.dto';
import { IProduct } from '../interface/product.interface';
import { ProductModel } from '../model/product.model';
import { SettingModel } from '../../setting/model/setting.model';

export default class ProductDao {
    async create(values: IProduct) {
        const product = new ProductModel(values);
        await product.save();
        return product;
    } //tugadi

    async getById(uid: number) {
        const product = await ProductModel.aggregate([
            {
                $addFields: { features: '$characteritics' },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
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
                $match: { uid },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: 'uid',
                    as: 'brand',
                },
            },
            {
                $lookup: {
                    from: 'subfeatures',
                    localField: 'characteristics.values.uid',
                    foreignField: 'uid',
                    as: 'features',
                },
            },
            {
                $lookup: {
                    from: 'features',
                    localField: 'characteristics.uid',
                    foreignField: 'uid',
                    as: 'characteristics',
                },
            },
            {
                $addFields: {
                    brand: '$brand.title',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skuList',
                },
            },
            {
                $addFields: {
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
                                $add: ['$$value', '$$this.quantitySold'],
                            },
                        },
                    },
                    totalAvailableAmount: {
                        $reduce: {
                            input: '$skuList',
                            initialValue: 0,
                            in: {
                                $add: ['$$value', '$$this.availableAmount'],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    categoryInfo: 0,
                    parentCategories: 0,
                    'category._id': 0,
                    'category.adult': 0,
                    'category.createdAt': 0,
                    'category.updatedAt': 0,
                    'category.__v': 0,
                    'category.parent._id': 0,
                    'category.parent.adult': 0,
                    'category.parent.createdAt': 0,
                    'category.parent.updatedAt': 0,
                    'category.parent.__v': 0,
                    'category.parent.level': 0,
                    'category.parent.parent._id': 0,
                    'category.parent.parent.adult': 0,
                    'category.parent.parent.createdAt': 0,
                    'category.parent.parent.updatedAt': 0,
                    'category.parent.parent.__v': 0,
                    'category.parent.parent.avatar': 0,
                    'category.parent.parent.level': 0,
                    sku: 0,
                    __v: 0,
                    'characteristics._id': 0,
                    'characteristics.updatedAt': 0,
                    'characteristics.createdAt': 0,
                    'characteristics.__v': 0,
                    'characteristics.values._id': 0,
                    'characteristics.values.updatedAt': 0,
                    'characteristics.values.createdAt': 0,
                    'characteristics.values.__v': 0,
                    'characteristics.values.charId': 0,
                    'characteristics.values.sku': 0,
                    features: 0,
                    'skulist._id': 0,
                    'skulist.productId': 0,
                    'skulist.characteristics._id': 0,
                    'skulist.characteristicsTitle': 0,
                    'skulist.skuTitle': 0,
                    'skulist.barcode': 0,
                },
            },
        ]);

        return product[0];
    } //tugadi

    async findOne(uid: number) {
        return await ProductModel.findOne({ uid });
    }

    async getForupdateSku(uid: number) {
        const product = await ProductModel.aggregate([
            {
                $match: { uid },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skuList',
                },
            },
            {
                $addFields: {
                    skuList: '$skuList',
                    productSku: '$sku',
                    image: { $first: '$images' },
                },
            },
            {
                $project: {
                    'skuList.uid': 1,
                    'skuList.productId': 1,
                    'skuList.availableAmount': 1,
                    'skuList.fullPrice': 1,
                    'skuList.boughtPrice': 1,
                    'skuList.referalPrice': 1,
                    'skuList.discountPrice': 1,
                    'skuList.purchasePrice': 1,
                    'skuList.blocked': 1,
                    'skuList.allowMarket': 1,
                    'skuList.skuTitle': 1,
                    'skuList.characteristicsTitle': 1,
                    image: '$image.image.80.high',
                    productSku: 1,
                    _id: 0,
                },
            },
        ]);

        return product[0];
    } //tugadi

    async update(uid: number, dto: IProduct) {
        const product = await ProductModel.findOne({ uid });

        Object.assign(product, dto);

        return await product.save();
    } //tugadi

    async getAll(filter?: string, page?: number, limit?: number) {
        const countProduct = await ProductModel.find({
            blocked: false,
        })
            .or([
                {
                    'title.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const products = await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    category: 1,
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                    rating: 1,
                    uid: 1,
                    reviewsAmount: 1,
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                    fullPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.fullPrice',
                                ],
                            },
                        },
                    },
                },
            },
        ]);

        return { products, countPage: Math.ceil(countProduct / limit) };
    } //tugadi

    async getForUpdateOrder(filter?: string) {
        return await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'subfeatures',
                    localField: 'characteristics.values.uid',
                    foreignField: 'uid',
                    as: 'features',
                },
            },
            {
                $lookup: {
                    from: 'features',
                    localField: 'characteristics.uid',
                    foreignField: 'uid',
                    as: 'characteristics',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skuList',
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $addFields: {
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                    skuList: '$skuList',
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
                                $add: ['$$value', '$$this.quantitySold'],
                            },
                        },
                    },
                    totalAvailableAmount: {
                        $reduce: {
                            input: '$skuList',
                            initialValue: 0,
                            in: {
                                $add: ['$$value', '$$this.availableAmount'],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    sku: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    'characteristics._id': 0,
                    'characteristics.updatedAt': 0,
                    'characteristics.createdAt': 0,
                    'characteristics.__v': 0,
                    'characteristics.values._id': 0,
                    'characteristics.values.updatedAt': 0,
                    'characteristics.values.createdAt': 0,
                    'characteristics.values.__v': 0,
                    'characteristics.values.charId': 0,
                    'characteristics.values.sku': 0,
                    features: 0,
                    'skulist._id': 0,
                    'skulist.productId': 0,
                    'skulist.characteristics._id': 0,
                    'skulist.characteristicsTitle': 0,
                    'skulist.skuTitle': 0,
                    'skulist.barcode': 0,
                },
            },
            {
                $limit: 10,
            },
        ]);
    } //tugadi

    async getAllForMarket(
        filter?: string,
        page?: number,
        limit?: number,
        uid?: number
    ) {
        if (uid) {
            const countProduct = await ProductModel.aggregate([
                {
                    $match: {
                        blocked: false,
                        category: uid,
                        allowMarket: true,
                        $or: [
                            {
                                'title.uz': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'title.ru': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'title.en': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'description.uz': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'description.ru': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'description.en': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                        ],
                    },
                },
                { $count: 'Total' },
            ]);
            const products = await ProductModel.aggregate([
                {
                    $match: {
                        blocked: false,
                        category: uid,
                        allowMarket: true,
                        $or: [
                            {
                                'title.uz': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'title.ru': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'title.en': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'description.uz': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'description.ru': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                            {
                                'description.en': {
                                    $regex: filter ? filter : '',
                                    $options: 'i',
                                },
                            },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: 'skus',
                        localField: 'uid',
                        foreignField: 'productId',
                        as: 'skus',
                    },
                },
                {
                    $sort: { createdAt: -1 },
                },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        _id: 0,
                        uid: 1,
                        title: 1,
                        category: 1,
                        rating: 1,
                        reviewsAmount: 1,
                        purchasePrice: {
                            $reduce: {
                                input: '$skus',
                                initialValue: Infinity,
                                in: {
                                    $min: [
                                        '$$value.purchasePrice',
                                        '$$this.purchasePrice',
                                    ],
                                },
                            },
                        },
                        referalPrice: {
                            $reduce: {
                                input: '$skus',
                                initialValue: Infinity,
                                in: {
                                    $min: [
                                        '$$value.referalPrice',
                                        '$$this.referalPrice',
                                    ],
                                },
                            },
                        },
                        image: { $arrayElemAt: ['$images.image.540.high', 0] },
                    },
                },
            ]);

            return {
                products,
                countPage: countProduct[0]
                    ? Math.ceil(countProduct[0]['Total'] / limit)
                    : 0,
            };
        }
        const countProduct = await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    allowMarket: true,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            { $count: 'Total' },
        ]);
        const products = await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    allowMarket: true,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    title: 1,
                    category: 1,
                    reviewsAmount: 1,
                    rating: 1,
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                    referalPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.referalPrice',
                                    '$$this.referalPrice',
                                ],
                            },
                        },
                    },
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                },
            },
        ]);

        return {
            products,
            countPage: countProduct[0]
                ? Math.ceil(countProduct[0]['Total'] / limit)
                : 0,
        };
    } //tugadi

    async getFilterOptions(categoryId: number) {
        const colors = await ProductModel.aggregate([
            {
                $match: { blocked: false, category: categoryId },
            },
            {
                $lookup: {
                    from: 'subfeatures',
                    localField: 'characteristics.values.uid',
                    foreignField: 'uid',
                    as: 'subfeatures',
                },
            },
            {
                $unwind: '$subfeatures',
            },
            {
                $group: {
                    _id: '$subfeatures.uid',
                    subfeature: { $first: '$subfeatures' },
                },
            },
            {
                $replaceRoot: { newRoot: '$subfeature' },
            },
            { $match: { isColor: true } },
            { $project: { _id: 0, title: 1, uid: 1, value: 1 } },
        ]);

        const brands = await ProductModel.aggregate([
            {
                $match: { blocked: false, category: categoryId },
            },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: 'uid',
                    as: 'brands',
                },
            },
            {
                $unwind: '$brands',
            },
            {
                $group: {
                    _id: '$brands.uid',
                    brand: { $first: '$brands' },
                },
            },
            {
                $replaceRoot: { newRoot: '$brand' },
            },
            {
                $project: { title: 1, uid: 1 },
            },
        ]);

        return { colors, brands };
    }

    async getFull({
        filter,
        page,
        limit,
        categoryId,
        color,
        minPrice,
        maxPrice,
        brand,
        sorting,
        ordering,
    }: {
        filter?: string;
        page?: number;
        limit?: number;
        categoryId?: number;
        color?: string[];
        minPrice?: number;
        maxPrice?: number;
        brand?: string[];
        sorting?: string;
        ordering?: string;
    }) {
        const prices = await ProductModel.aggregate([
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $project: {
                    _id: 0,
                    price: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
        ]);
        var matchOptions: any = {
            blocked: false,
            category: categoryId,
            $or: [
                {
                    'title.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ],
        };
        var pipeline: any = [
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $addFields: {
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                },
            },
            {
                $match: matchOptions,
            },
            {
                $sort: { createdAt: 1 },
            },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    category: 1,
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                    rating: 1,
                    uid: 1,
                    reviewsAmount: 1,
                    purchasePrice: 1,
                    fullPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.fullPrice',
                                ],
                            },
                        },
                    },
                },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ];

        switch (sorting) {
            case 'price':
                switch (ordering) {
                    case 'ascending':
                        pipeline[3] = {
                            $sort: { price: 1 },
                        };
                        break;
                    case 'descending':
                        pipeline[3] = {
                            $sort: { price: -1 },
                        };
                        break;
                }
                break;
            case 'rating':
                switch (ordering) {
                    case 'ascending':
                        pipeline[3] = {
                            $sort: { rating: 1 },
                        };
                        break;
                    case 'descending':
                        pipeline[3] = {
                            $sort: { rating: -1 },
                        };
                        break;
                }
                break;
            case 'date':
                switch (ordering) {
                    case 'ascending':
                        pipeline[3] = {
                            $sort: { createdAt: 1 },
                        };
                        break;
                    case 'descending':
                        pipeline[3] = {
                            $sort: { createdAt: -1 },
                        };
                        break;
                }
                break;
        }

        if (minPrice && !maxPrice) {
            matchOptions.price = { $gte: minPrice };
        }

        if (maxPrice && !minPrice) {
            matchOptions.price = { $lte: maxPrice };
        }

        if (maxPrice && minPrice) {
            matchOptions.price = { $lte: maxPrice, $gte: minPrice };
        }

        if (brand?.length && !brand.includes(undefined)) {
            let values = brand.map((e) => +e);
            matchOptions.brand = { $in: { values } };
        }

        if (color?.length && !brand.includes(undefined)) {
            let values = color.map((e) => +e);
            matchOptions['skus.characteristics.uid'] = { $in: { values } };
        }

        const countProduct = await ProductModel.aggregate([
            ...pipeline,
            { $count: 'Total' },
        ]);
        const products = await ProductModel.aggregate(pipeline);

        return {
            products,
            countPage: countProduct[0]
                ? Math.ceil(countProduct[0]['Total'] / limit)
                : 0,
            size: countProduct[0] ? countProduct[0]['Total'] : 0,
            prices: prices
                ? { minPrice: prices[0].minPrice, maxPrice: prices[0].maxPrice }
                : {},
        };
    } //tugadi

    async delete(uid: number) {
        const product = await ProductModel.deleteOne({ uid });

        return product;
    } //tugadi

    async getCount(categoryId: number) {
        return await ProductModel.find({ category: categoryId }).count();
    } //tugadi

    async getAllProducts(filter?: string, page?: number, limit?: number) {
        const countProduct = await ProductModel.find({
            blocked: false,
        })
            .or([
                {
                    'title.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const products = await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'uid',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    title: 1,
                    category: { $first: '$category.title' },
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                    referalPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.referalPrice',
                                    '$$this.referalPrice',
                                ],
                            },
                        },
                    },
                    totalAvailableAmount: {
                        $reduce: {
                            input: '$skus',
                            initialValue: 0,
                            in: {
                                $add: ['$$value', '$$this.availableAmount'],
                            },
                        },
                    },
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                },
            },
        ]);
        return { products, countPage: Math.ceil(countProduct / limit) };
    } // tugadi

    async getAllProductsAdmin(filter?: string, page?: number, limit?: number) {
        const countProduct = await ProductModel.find()
            .or([
                {
                    'title.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'title.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.uz': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.ru': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
                {
                    'description.en': {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const products = await ProductModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'uid',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    title: 1,
                    createdAt: 1,
                    referalPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: 0,
                            in: {
                                $min: [
                                    '$$value.referalPrice',
                                    '$$this.referalPrice',
                                ],
                            },
                        },
                    },
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: 0,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                    totalAvailableAmount: {
                        $reduce: {
                            input: '$skus',
                            initialValue: 0,
                            in: {
                                $min: ['$$value', '$$this.availableAmount'],
                            },
                        },
                    },
                    category: { $first: '$category.title' },
                    image: { $arrayElemAt: ['$images.image.80.high', 0] },
                    blocked: 1,
                    allowMarket: 1,
                },
            },
        ]);
        return { products, countPage: Math.ceil(countProduct / limit) };
    } //tugadi

    async getCheapProductsBySettingsValue(
        page?: number,
        limit?: number,
        filter?: string
    ) {
        const [{ highestPriceForCheapProducts }] =
            await SettingModel.find().select('-eskiz_token');

        const countProduct = await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $addFields: {
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                },
            },
            {
                $match: {
                    purchasePrice: { $lt: highestPriceForCheapProducts },
                },
            },
            { $count: 'Total' },
        ]);
        const products = await ProductModel.aggregate([
            {
                $match: {
                    blocked: false,
                    $or: [
                        {
                            'title.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'title.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.uz': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.ru': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                        {
                            'description.en': {
                                $regex: filter ? filter : '',
                                $options: 'i',
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $addFields: {
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                },
            },
            {
                $match: {
                    purchasePrice: { $lt: highestPriceForCheapProducts },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    title: 1,
                    category: 1,
                    uid: 1,
                    purchasePrice: 1,
                    reviewsAmount: 1,
                    fullPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.fullPrice',
                                ],
                            },
                        },
                    },
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                    rating: 1,
                },
            },
        ]);

        return {
            products,
            countPage: countProduct[0]
                ? Math.ceil(countProduct[0]['Total'] / limit)
                : 0,
            size: countProduct,
        };
    } // tugadi

    async getProductIds() {
        return await ProductModel.find().select('uid -_id -__v');
    } //tugadi

    async getNewestProducts() {
        return await ProductModel.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'uid',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'skus',
                },
            },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    reviewsAmount: 1,
                    rating: 1,
                    title: 1,
                    category: { $first: '$category.title' },
                    purchasePrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                    fullPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.fullPrice',
                                ],
                            },
                        },
                    },
                    referalPrice: {
                        $reduce: {
                            input: '$skus',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.referalPrice',
                                    '$$this.referalPrice',
                                ],
                            },
                        },
                    },
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                },
            },
        ]);
    } //tugadi

    async getBestSelledProducts() {
        return await ProductModel.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'uid',
                    as: 'category',
                },
            },
            {
                $lookup: {
                    from: 'skus',
                    localField: 'uid',
                    foreignField: 'productId',
                    as: 'variants',
                },
            },
            {
                $addFields: {
                    quantitySold: {
                        $reduce: {
                            input: '$variants',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.quantitySold'] },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    reviewsAmount: 1,
                    rating: 1,
                    title: 1,
                    category: { $first: '$category.title' },
                    purchasePrice: {
                        $reduce: {
                            input: '$variants',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.purchasePrice',
                                ],
                            },
                        },
                    },
                    fullPrice: {
                        $reduce: {
                            input: '$variants',
                            initialValue: Infinity,
                            in: {
                                $min: [
                                    '$$value.purchasePrice',
                                    '$$this.fullPrice',
                                ],
                            },
                        },
                    },
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
                    image: { $arrayElemAt: ['$images.image.540.high', 0] },
                },
            },
            { $limit: 10 },
        ]);
    } //tugadi
}
