import ErrorResponse from '../shared/utils/errorResponse';
import SubFeaturesDao from './dao/subfeatures.dao';
import { UpdateSubFeatureDto } from './dto/subfeatures.dto';
import { ISubFeature } from './interface/subfeatures.interface';

export default class SubFeaturesService {
    private subFeaturesDao = new SubFeaturesDao();

    async create(values: ISubFeature) {
        const SUBfeature = await this.subFeaturesDao.create(values);

        return SUBfeature;
    }

    async update(id: string, values: UpdateSubFeatureDto) {
        const foundSubFeature = await this.subFeaturesDao.findOne(id);
        if (!foundSubFeature)
            throw new ErrorResponse(404, 'Sub feature not found');
        return await this.subFeaturesDao.update(id, values);
    }

    async findOne(id: string) {
        const foundSubFeature = await this.subFeaturesDao.findOne(id);

        if (!foundSubFeature)
            throw new ErrorResponse(404, 'Sub feature not found');
        return foundSubFeature;
    }

    async findByFeature(uid: number) {
        return await this.subFeaturesDao.findByFeature(uid);
    }

    async delete(id: string) {
        const foundSubFeature = await this.subFeaturesDao.findOne(id);

        if (!foundSubFeature)
            throw new ErrorResponse(404, 'Sub feature not found');
        return await this.subFeaturesDao.delete(id);
    }

    async getColors() {
        return await this.subFeaturesDao.getColors();
    }
}
