import ErrorResponse from '../shared/utils/errorResponse';
import SkuDao from './dao/sku.dao';
import { ISku, IUpdateSku } from './interface/sku.interface';

export default class SkuService {
    private dao = new SkuDao();

    async create(values: ISku) {
        return await this.dao.create(values);
    }

    async update(uid: number, values: IUpdateSku) {
        return await this.dao.update(uid, values);
    }

    async deleteProductSkus(uid: number) {
        await this.dao.deleteProductSkus(uid);
    }

    async findOne(uid: number) {
        const variant = await this.dao.findOne(uid);

        if (!variant) throw new ErrorResponse(404, 'Not found');

        return variant;
    }
}
