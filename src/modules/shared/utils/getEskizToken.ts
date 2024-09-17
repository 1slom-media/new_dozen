import axios from 'axios';
import { eskiz } from '../../../config/conf';
import { writeToEnvFile } from './envWriter';

export const getEskizToken = async () => {
    try {
        const { data } = await axios({
            method: 'post',
            url: 'https://notify.eskiz.uz/api/auth/login',
            data: {
                email: eskiz.email,
                password: eskiz.password,
            },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            },
            proxy: undefined,
        });
        // console.log(data.data.token);

        writeToEnvFile(data.data.token);
    } catch (err) {
        console.log(err.message);
    }
};
