import { ProductModel } from '../../product/model/product.model';
import { IBanner } from '../interface/banner.interface';
import { BannerModel } from '../model/banner.model';

export class BannersDao {
    async create(values: IBanner) {
        const banner = new BannerModel(values);

        return await banner.save();
    }

    async getAll() {
        return await BannerModel.find({ active: true });
    }

    async getAllForAdmin() {
        return await BannerModel.find().populate({
            path: 'productId',
            model: ProductModel,
            select: 'title uid',
        });
    }

    async getOne(id: string) {
        return await BannerModel.findById(id);
    }

    async delete(id: string) {
        await BannerModel.findByIdAndDelete(id);
    }

    async update(id: string, active: boolean) {
        return await BannerModel.findByIdAndUpdate(
            id,
            { active },
            { new: true }
        );
    }
}
