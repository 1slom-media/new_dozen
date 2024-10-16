import ErrorResponse from '../shared/utils/errorResponse';
import ProductDao from './dao/product.dao';
import { IProduct } from './interface/product.interface';
import { UpdateProductDto } from './dto/product.dto';
import BotSettingsService from '../botSettings/botSettings.service';
import {
    sendNewProduct,
    sendUpdatedProduct,
} from '../shared/utils/sendMessage';
import SkuService from './sku.service';
import skuCombinator from '../shared/utils/skuCombinator';
import { IUpdateSku } from './interface/sku.interface';

export default class ProductService {
    private skuDao = new SkuService();
    private productDao = new ProductDao();
    private botSettings = new BotSettingsService();

    async create({
        category,
        description,
        title,
        images,
        adult,
        allowMarket,
        characteristics,
        brand,
        madeIn,
        sizesDescription,
        featureDescription,
        video,
        seller,
        positions
    }: IProduct) {
        var productCharacteristics = [];
        if (characteristics)
            characteristics.forEach((character) => {
                let characterValues = [];
                character.values.forEach((value) => {
                    characterValues.push({ uid: value.uid });
                });
                productCharacteristics.push({
                    uid: character.uid,
                    values: characterValues,
                });
            });
        const product = await this.productDao.create({
            category,
            description,
            title,
            images,
            adult,
            allowMarket,
            characteristics: productCharacteristics,
            brand,
            madeIn,
            sizesDescription,
            featureDescription,
            video,
            seller,
            positions,
            blocked: true,
        });
        

        if (characteristics.length) {
            const skus = characteristics.map((e) => e.values);
            const skuCharacteristics: {
                title: { uz: string; ru: string; en: string };
                uid: number;
                value: string;
                isColor: boolean;
                sku: string;
                charId: number;
            }[][] = skuCombinator(skus);

            skuCharacteristics.forEach(async (values) => {
                var skuTitle = 'VIPSAVDO';
                var characteristicsTitle = `VIPSAVDO, ${product?.title?.en}`;
                var skuCharacteristics = [];
                values.forEach((element, index) => {
                    skuCharacteristics.push({
                        charId: element.charId,
                        uid: element.uid,
                    });
                    skuTitle += `-${element?.sku}`;
                    characteristicsTitle += `, ${element?.title?.en}`;
                });
                await this.skuDao.create({
                    productId: product.uid,
                    characteristics: skuCharacteristics,
                    characteristicsTitle: characteristicsTitle,
                    skuTitle: skuTitle,
                });
            });

            return { uid: product.uid };
        }

        await this.skuDao.create({ productId: product.uid });

        return { uid: product.uid };
    }

    async update(id: number, productValues: IProduct) {
        const foundProduct: IProduct = await this.productDao.getById(id);

        if (!foundProduct) {
            throw new ErrorResponse(404, 'Bunday maxsulot topilmadi!');
        }

        if (
            productValues?.characteristics &&
            productValues.characteristics.length
        ) {
            const skus = productValues.characteristics.map((e) => e.values);
            const skuCharacteristics: {
                title: { uz: string; ru: string; en: string };
                uid: number;
                value: string;
                isColor: boolean;
                sku: string;
                charId: number;
            }[][] = skuCombinator(skus);

            skuCharacteristics.forEach(async (values) => {
                var skuTitle = `VIPSAVDO-${foundProduct.title.en}`;
                var characteristicsTitle = `VIPSAVDO, ${foundProduct.title.en}`;
                var skuCharacteristics = [];
                values.forEach((element, index) => {
                    skuCharacteristics.push({
                        charId: element.charId,
                        uid: element.uid,
                    });

                    skuTitle += `-${element.sku}`;
                    characteristicsTitle += `, ${element.title.en}`;
                });
                await this.skuDao.create({
                    productId: id,
                    characteristics: skuCharacteristics,
                    characteristicsTitle: characteristicsTitle,
                    skuTitle: skuTitle,
                });
            });

            let productCharacteristics = [];
            productValues.characteristics.forEach((character) => {
                let characterValues = [];
                character.values.forEach((value) => {
                    characterValues.push({ uid: value.uid });
                });
                productCharacteristics.push({
                    uid: character.uid,
                    values: characterValues,
                });
            });

            productValues.characteristics = productCharacteristics;
        }

        return await this.productDao.update(id, productValues);
    }

    async findOne(id: number) {
        const foundProduct: IProduct = await this.productDao.getById(id);

        if (!foundProduct) {
            throw new ErrorResponse(404, 'Bunday maxsulot mavjud emas!');
        }

        return foundProduct;
    }

    async getOnlyproduct(uid: number) {
        return await this.productDao.findOne(uid);
    }

    async getForupdateSku(id: number) {
        const foundProduct: IProduct = await this.productDao.getForupdateSku(
            id
        );

        if (!foundProduct) {
            throw new ErrorResponse(404, 'Bunday maxsulot mavjud emas!');
        }

        return foundProduct;
    }

    async updateSkus(skuList: IUpdateSku[], productSku?: string) {
        if (productSku)
            await this.productDao.update(skuList[0].productId, {
                sku: productSku,
            });
        for await (const sku of skuList) {
            await new Promise(async (resolve, reject) => {
                if (sku?.discountPrice > 0) {
                    sku.purchasePrice = sku?.fullPrice - sku?.discountPrice;
                } else {
                    sku.discountPrice = 0;
                    sku.purchasePrice = sku?.fullPrice;
                }
                if (sku?.availableAmount <= 0 || sku?.fullPrice <= 0) {
                    sku.blocked = true;
                }
                if (sku?.referalPrice <= 0) sku.allowMarket = false;

                const chunk = await this.skuDao.update(sku.uid, {
                    availableAmount: sku?.availableAmount,
                    boughtPrice: sku?.boughtPrice,
                    discountPrice: sku?.discountPrice,
                    fullPrice: sku?.fullPrice,
                    referalPrice: sku?.referalPrice,
                    blocked: sku?.blocked,
                    allowMarket: sku?.allowMarket,
                    purchasePrice: sku?.purchasePrice,
                    sellerPrice:sku?.sellerPrice,
                    comission:sku?.comission,
                    operatorPrice:sku.operatorPrice,
                    skuTitle:
                        sku?.skuTitle && productSku
                            ? sku?.skuTitle.split('-')[0] +
                              '-' +
                              productSku +
                              sku?.skuTitle.split(sku?.skuTitle.split('-')[0])
                            : sku?.skuTitle,
                });

                resolve(chunk);
            });
        }

        return { message: 'Xususiyatlar muvaffaqqiyatli tahrirlandi' };
    }

    async getAll(filter?: string, page?: number, limit?: number) {
        return this.productDao.getAll(filter, page, limit);
    }

    async getAllForMarket(
        filter?: string,
        page?: number,
        limit?: number,
        uid?: number
    ) {
        return this.productDao.getAllForMarket(filter, page, limit);
    }

    async getByCategoryId({
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
        return this.productDao.getFull({
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
        });
    }

    async getCount(id: number) {
        var message: string;
        const count: number = await this.productDao.getCount(id);

        return count;
    }

    async delete(id: number) {
        const foundProduct: IProduct = await this.productDao.getById(id);

        if (!foundProduct) {
            throw new ErrorResponse(404, 'Bunday maxsulot topilmadi!');
        }

        await this.skuDao.deleteProductSkus(id);
        return await this.productDao.delete(id);
    }

    async getAllProducts(filter?: string, page?: number, limit?: number) {
        return await this.productDao.getAllProducts(filter, page, limit);
    }

    async getAllProductsAdmin(filter?: string, page?: number, limit?: number) {
        return await this.productDao.getAllProductsAdmin(filter, page, limit);
    }
    async getAllProductsSeller(sellerId?: string,filter?: string, page?: number, limit?: number) {
        return await this.productDao.getAllProductsSeller(sellerId,filter, page, limit);
    }

    async getCheapProductsBySettingsValue(
        page?: number,
        limit?: number,
        filter?: string
    ) {
        return await this.productDao.getCheapProductsBySettingsValue(
            page,
            limit,
            filter
        );
    }

    async getProductIds() {
        return await this.productDao.getProductIds();
    }

    async getNewestProducts() {
        return await this.productDao.getNewestProducts();
    }

    async getBestSelledProducts() {
        return await this.productDao.getBestSelledProducts();
    }

    async getForUpdateOrder(filter: string) {
        return await this.productDao.getForUpdateOrder(filter);
    }
    async getFilterOptions(categoryId: number) {
        return await this.productDao.getFilterOptions(categoryId);
    }

    async getProductWithVariantId(variantId: number) {
        const sku = await this.skuDao.findOne(variantId);

        const product = await this.productDao.findOne(sku.productId);

        return {
            description: product.description.uz,
            image: product.images[0].image[720].high,
            id: sku.uid,
        };
    }
}
