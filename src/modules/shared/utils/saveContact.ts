import axios from 'axios';
import { eskiz } from '../../../config/conf';
import SettingService from '../../setting/setting.service';

export const SaveConatct = async (phone: string) => {
    try {
        const settingsService = new SettingService();
        const token = await settingsService.getEskizToken();
        await axios({
            method: 'post',
            url: 'https://notify.eskiz.uz/api/contact',
            data: {
                group: eskiz.group_id,
                mobile_phone: phone,
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            },
            proxy: undefined,
        });
    } catch (err) {
        console.log(
            `Kontaktda mavjud bo'lishi mumkin! on function saveContact`
        );
    }
};
