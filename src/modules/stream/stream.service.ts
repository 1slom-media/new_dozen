import ProductService from '../product/product.service';
import ErrorResponse from '../shared/utils/errorResponse';
import StreamDao from './dao/stream.dao';
import { UpdateStreamDto } from './dto/stream.dto';
import { IStream } from './interface/stream.interface';

export default class StreamService {
    private productService = new ProductService();
    private streamDao = new StreamDao();

    async create(streamData: IStream) {
        const product = await this.productService.findOne(streamData.product);

        if (!product?.allowMarket)
            throw new ErrorResponse(400, 'Mahsulotni market uchun ruxsati yoq');

        const stream = await this.streamDao.create(streamData);

        return stream;
    }

    async getAll(
        userId: string,
        page: number,
        limit: number,
        filter: string = ''
    ) {
        return this.streamDao.getAll(userId, page, limit, filter);
    }

    async findOne(number: number) {
        const foundStream: IStream = await this.streamDao.getOne(number);

        if (!foundStream) {
            throw new ErrorResponse(404, 'Bunday Oqim mavjud emas!');
        }

        await this.streamDao.updateStream(foundStream._id, {
            visits_count: foundStream.visits_count + 1,
        });

        return foundStream;
    }

    async delete(id: string) {
        const foundStream: IStream = await this.streamDao.findById(id);

        if (!foundStream) {
            throw new ErrorResponse(404, 'Bunday Oqim topilmadi!');
        }

        return await this.streamDao.updateStream(id, { isDeleted: true });
    }

    async findById(id: string) {
        const foundStream: IStream = await this.streamDao.findById(id);

        if (!foundStream) {
            throw new ErrorResponse(404, 'Bunday Oqim mavjud emas!');
        }

        return foundStream;
    }

    async updateForUser(streamId: number, status: boolean) {
        return await this.streamDao.updateForUser(streamId, status);
    }

    async getAllStreamNumber() {
        return await this.streamDao.getAllStreamNumber();
    }

    async getDetailStream(number: number, user: string) {
        const stream = await this.streamDao.getDetailStream(number, user);
        if (!stream) throw new ErrorResponse(404, 'Oqim topilmadi!');
        return stream;
    }

    async getStreams(user: string) {
        const stream = await this.streamDao.getStreams(user);
        if (!stream) throw new ErrorResponse(404, 'Oqim topilmadi!');
        return stream;
    }

    async findByUserId(id: string) {
        return await this.streamDao.findByUserId(id);
    }
}
