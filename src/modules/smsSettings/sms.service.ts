import ErrorResponse from '../shared/utils/errorResponse';
import SmsServiceDao from './dao/sms.dao';
import { UpdateSmsServiceDto } from './dto/sms.dto';

export default class SmsServiceService {
    private smsServiceDao = new SmsServiceDao();

    async create() {
        const stream = await this.smsServiceDao.getSmsService();
        if (stream.length > 0) return;
        return await this.smsServiceDao.create();
    }

    async update(values: UpdateSmsServiceDto) {
        const stream = await this.smsServiceDao.getSmsService();

        if (stream.length == 0)
            throw new ErrorResponse(404, 'Sms sozlamalari mavjud emas');
        return await this.smsServiceDao.update(
            stream[0]._id.toString(),
            values
        );
    }

    async getSmsService() {
        const stream = await this.smsServiceDao.getSmsService();
        if (stream.length) return stream[0];
        return {};
    }
}
