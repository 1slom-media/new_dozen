import axios from 'axios';
import { company } from '../../../config/conf';

export const subscriptionCheker = async () => {
    try {
        const { data } = await axios({
            method: 'get',
            url: company.crm_address + '/apps/' + company.crm_id,
            headers: {
                'Content-Type': ' application/json',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            },
        });

        return data;
    } catch (err) {
        console.log(err.message);
    }
};
