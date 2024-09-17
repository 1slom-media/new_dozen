import { UpdateCategoryDto } from '../dto/category.dto';
import { ICreateCategory } from '../interface/category.interface';
import { CategoryModel } from '../model/category.model';

export default class CategoryDao {
    async cerate(
        { title, avatar, adult }: ICreateCategory,
        categoryId?: number
    ) {
        if (categoryId) {
            const subCategory = new CategoryModel({
                title,
                avatar,
                adult,
                parent: categoryId,
            });

            return await subCategory.save();
        } else {
            const category = new CategoryModel({
                title,
                avatar,
                adult,
            });
            await category.save();
            return category;
        }
    }

    async getAll() {
        return await CategoryModel.aggregate([
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$uid',
                    connectFromField: 'uid',
                    connectToField: 'parent',
                    as: 'children',
                    maxDepth: 10,
                    depthField: 'level',
                },
            },
            { $match: { parent: null } },
            {
                $addFields: {
                    children: {
                        $map: {
                            input: '$children',
                            as: 'child',
                            in: {
                                $mergeObjects: [
                                    '$$child',
                                    {
                                        children: {
                                            $filter: {
                                                input: '$children',
                                                as: 'subChild',
                                                cond: {
                                                    $eq: [
                                                        '$$subChild.parent',
                                                        '$$child.uid',
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
                $addFields: {
                    children: {
                        $map: {
                            input: '$children',
                            as: 'child',
                            in: {
                                $mergeObjects: [
                                    '$$child',
                                    {
                                        children: {
                                            $filter: {
                                                input: '$children',
                                                as: 'subChild',
                                                cond: {
                                                    $eq: [
                                                        '$$subChild.parent',
                                                        '$$child.uid',
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
                $addFields: {
                    children: {
                        $map: {
                            input: '$children',
                            as: 'child',
                            in: {
                                $mergeObjects: [
                                    '$$child',
                                    {
                                        children: {
                                            $filter: {
                                                input: '$children',
                                                as: 'subChild',
                                                cond: {
                                                    $eq: [
                                                        '$$subChild.parent',
                                                        '$$child.uid',
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
                $project: {
                    title: 1,
                    avatar: 1,
                    adult: 1,
                    parent: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    uid: 1,
                    children: {
                        $filter: {
                            input: '$children',
                            cond: { $ne: ['$$this.level', 1] },
                        },
                    },
                },
            },
        ]);
    }

    async getAllForAdmin(page: number, limit: number, filter: string) {
        const countPage = await CategoryModel.find({ parent: null })
            .or([
                {
                    label: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const categories = await CategoryModel.find({ parent: null })
            .or([
                {
                    label: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .skip((page - 1) * limit)
            .limit(limit);
        return { countPage: Math.ceil(countPage / limit), categories };
    }

    async getById(categoryId: number) {
        const data = await CategoryModel.aggregate([
            { $match: { uid: categoryId } },
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$uid',
                    connectFromField: 'uid',
                    connectToField: 'parent',
                    as: 'children',
                    maxDepth: 10,
                    depthField: 'level',
                },
            },
            {
                $addFields: {
                    children: {
                        $map: {
                            input: '$children',
                            as: 'child',
                            in: {
                                $mergeObjects: [
                                    '$$child',
                                    {
                                        children: {
                                            $filter: {
                                                input: '$children',
                                                as: 'subChild',
                                                cond: {
                                                    $eq: [
                                                        '$$subChild.parent',
                                                        '$$child.uid',
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
                $project: {
                    title: 1,
                    avatar: 1,
                    adult: 1,
                    parent: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    uid: 1,
                    children: {
                        $filter: {
                            input: '$children',
                            cond: { $ne: ['$$this.level', 1] },
                        },
                    },
                },
            },
        ]);

        return data[0];
    }

    async update(categoryId: number, values: UpdateCategoryDto) {
        const category = await CategoryModel.findOneAndUpdate(
            { uid: categoryId },
            values,
            { new: true }
        );
        return category;
    }

    async delete(categoryId: number) {
        const category = await CategoryModel.deleteOne({ uid: categoryId });

        return category;
    }
}
