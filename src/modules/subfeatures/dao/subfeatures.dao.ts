import { UpdateSubFeatureDto } from '../dto/subfeatures.dto';
import { ISubFeature } from '../interface/subfeatures.interface';
import { SubFeatureModel } from '../model/subfeatures.model';

export default class SubFeaturesDao {
    async create(values: ISubFeature) {
        let subFeature = new SubFeatureModel(values);

        return await subFeature.save();
    }

    async update(id: string, values: UpdateSubFeatureDto) {
        return await SubFeatureModel.findByIdAndUpdate(id, values, {
            new: true,
        });
    }

    async findOne(id: string) {
        return await SubFeatureModel.findById(id);
    }

    async findByFeature(id: number) {
        return await SubFeatureModel.find({ charId: id });
    }

    async delete(id: string) {
        return await SubFeatureModel.findByIdAndDelete(id);
    }

    async getColors() {
        return await SubFeatureModel.find({ isColor: true }).select(
            '-__v -_id -createdAt -updatedAt'
        );
    }
}
