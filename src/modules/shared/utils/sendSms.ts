import axios from 'axios';
import { eskiz } from '../../../config/conf';
import { subscriptionCheker } from './checkSubscription';
import { smsCounter } from './smsCounter';
import { SaveConatct } from './saveContact';
import ErrorResponse from './errorResponse';
import SettingService from '../../setting/setting.service';

export const sendSms = async (message, phone) => {
    try {
        const settingsService = new SettingService();
        const token = await settingsService.getEskizToken();

        // SaveConatct(phone);
        // const { subscription } = await subscriptionCheker();
        // if (subscription !== 'eco') {
        await axios({
            method: 'post',
            url: 'https://notify.eskiz.uz/api/message/sms/send',
            data: {
                mobile_phone: phone.slice(1),
                message,
                from: eskiz.from,
                callback_url: 'http://0000.uz/test.php',
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            },
            proxy: undefined,
        });

        if (
            phone.slice(4, 6) == '94' ||
            phone.slice(4, 6) == '93' ||
            phone.slice(4, 6) == '50'
        ) {
            await smsCounter(true);
        } else await smsCounter(false);
        // }
    } catch (err) {
        console.log(err.message, 'on function sendSms');
        ``;
        throw new Error(err.message);
    }
};
