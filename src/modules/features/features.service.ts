import ErrorResponse from '../shared/utils/errorResponse';
import FeaturesDao from './dao/features.dao';
import { CreateFeatureDto } from './dto/features.dto';

export default class FeaturesService {
    private featuresDao = new FeaturesDao();

    async create(data: CreateFeatureDto) {
        const feature = await this.featuresDao.create(data);
        return feature;
    }

    async update(uid: number, data: CreateFeatureDto) {
        const foundFeature = await this.featuresDao.findOne(uid);
        if (!foundFeature) throw new ErrorResponse(404, 'Feature not found');

        return await this.featuresDao.update(uid, data);
    }

    async findOne(uid: number) {
        const foundFeature = await this.featuresDao.findOne(uid);
        if (!foundFeature) throw new ErrorResponse(404, 'Feature not found');

        return foundFeature;
    }

    async findAll(limit: number, page: number, filter: string) {
        return await this.featuresDao.find(page, limit, filter);
    }

    async findAllWithSubfeatures(limit: number, page: number, filter: string) {
        return await this.featuresDao.findAllWithSubfeatures(
            page,
            limit,
            filter
        );
    }

    async delete(uid: number) {
        const foundFeature = await this.featuresDao.findOne(uid);
        if (!foundFeature) throw new ErrorResponse(404, 'Feature not found');

        return await this.featuresDao.delete(uid);
    }
}
