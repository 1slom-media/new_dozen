import { ISku, IUpdateSku } from '../interface/sku.interface';
import { SkuModel } from '../model/sku.model';

export default class SkuDao {
    async create(values: ISku) {
        const sku = new SkuModel(values);

        return await sku.save();
    }

    async update(uid: number, values: IUpdateSku) {
        return await SkuModel.findOneAndUpdate({ uid }, values, { new: true });
    }

    async deleteProductSkus(uid: number) {
        await SkuModel.deleteMany({ product: uid });
    }

    async findOne(uid: number) {
        return await SkuModel.findOne({ uid });
    }
}
