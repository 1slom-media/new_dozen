import { BrandsModel } from '../model/brands.model';

export class BrandsDao {
    async create(title: string) {
        const brand = new BrandsModel({ title });

        return await brand.save();
    }

    async update(uid: number, title: string) {
        return await BrandsModel.findOneAndUpdate(
            { uid },
            { title },
            { new: true }
        );
    }

    async getAll(page: number, limit: number, filter?: string) {
        const countPage = await BrandsModel.find()
            .or([{ title: { $regex: filter ? filter : '', $options: 'i' } }])
            .count();

        const brands = await BrandsModel.find()
            .or([{ title: { $regex: filter ? filter : '', $options: 'i' } }])
            .select('-_id -__v')
            .skip((page - 1) * limit)
            .limit(limit);

        return {
            countPage: Math.ceil(countPage / limit),
            size: countPage,
            brands,
        };
    }

    async findBycategory(categoryId: number) {
        return await BrandsModel.find({ categoryId }).select(
            '-_id -__v -createdAt -updatedAt'
        );
    }

    async findOne(uid: number) {
        return await BrandsModel.findOne({ uid }).select('-_id -__v');
    }

    async delete(uid: number) {
        await BrandsModel.findOneAndDelete({ uid });
    }
}
