import { ISms } from '../interface/sms.interface';
import { SmsModel } from '../model/sms.model';

export default class SmsServiceDao {
    async create() {
        const smsService = new SmsModel();
        return await smsService.save();
    }

    async update(id: string, values: ISms) {
        return await SmsModel.findByIdAndUpdate(id, values, { new: true });
    }

    async getSmsService() {
        return await SmsModel.find();
    }
}
