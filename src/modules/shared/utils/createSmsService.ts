import SmsServiceService from '../../smsSettings/sms.service';

export const createSmsSettings = async () => {
    const smsService = new SmsServiceService();
    await smsService.create();
};
