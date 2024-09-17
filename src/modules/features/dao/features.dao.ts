import { SubFeatureModel } from '../../subfeatures/model/subfeatures.model';
import { IFeatures } from '../interface/features.interface';
import { FeatureModel } from '../model/features.model';

export default class FeaturesDao {
    async create(values: IFeatures) {
        let feature = new FeatureModel(values);
        return await feature.save();
    }

    async update(uid: number, values: IFeatures) {
        return await FeatureModel.findOneAndUpdate({ uid }, values, {
            new: true,
        });
    }

    async findOne(uid: number) {
        return await FeatureModel.findOne({ uid });
    }

    async find(page: number, limit: number, filter: string) {
        const countPage = await FeatureModel.find()
            .or([
                {
                    name: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .count();
        const features = await FeatureModel.find()
            .or([
                {
                    name: {
                        $regex: filter ? filter : '',
                        $options: 'i',
                    },
                },
            ])
            .select('uid title createdAt updatedAt -_id')
            .skip((page - 1) * limit)
            .limit(limit);

        return { features, countPage: Math.ceil(countPage / limit) };
    }

    async findAllWithSubfeatures(page: number, limit: number, filter: string) {
        const features = await FeatureModel.aggregate([
            {
                $lookup: {
                    from: 'subfeatures',
                    foreignField: 'charId',
                    localField: 'uid',
                    as: 'values',
                },
            },
            {
                $addFields: {
                    subfeatures: '$values',
                },
            },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    title: 1,
                    'values.uid': 1,
                    'values.title': 1,
                    'values.value': 1,
                    'values.isColor': 1,
                    'values.sku': 1,
                    'values.charId': 1,
                },
            },
        ]);

        return features;
    }

    async delete(uid: number) {
        return await FeatureModel.findOneAndDelete({ uid });
    }
}
