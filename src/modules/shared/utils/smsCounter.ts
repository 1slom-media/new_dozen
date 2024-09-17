import axios from 'axios';
import { company } from '../../../config/conf';

export const smsCounter = async (isUcell: boolean) => {
    try {
        axios({
            method: 'put',
            url: company.crm_address + '/apps/sms/' + company.crm_id,
            data: {
                smsBalance: isUcell ? 115 : 50,
                secretKey: company.crm_key,
            },
            headers: {
                'Content-Type': ' application/json',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            },
        }).catch((err) => console.log(err?.response?.data?.message));
    } catch (err) {
        console.log(err.message);
    }
};
