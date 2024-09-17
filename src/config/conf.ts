import { config } from 'dotenv';

config();

const { env } = process;

export const MONGO_URI = env.MONGO_URL;

export const cloudinaryConf = {
    cloud_name: env.CLOUD_NAME || 'dm8rftj3p',
    api_key: env.CLOUDINARY_API_KEY || '342533349832212',
    api_secret: env.CLOUDINARY_API_SECRET || '8Sk-53ZKWc8glmioQn8ltCv09Ic',
};

export const server = {
    httpPort: env.PORT || 3030,
    nodeEnv: env.NODE_ENV || 'development',
    refreshToken: {
        secret: env.REFRESH_TOKEN_SECRET || 'secret',
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN || '365d',
    },
    accessToken: {
        secret: env.ACCESS_TOKEN_SECRET || 'secret',
        expiresIn: env.ACCESS_TOKEN_EXPIRES_IN || '14d',
    },
};

export const eskiz = {
    email: env.ESKIZ_EMAIL || 'jamshidbekml@gmail.com',
    password: env.ESKIZ_PASSWORD || '123456789',
    from: env.SMS_FROM,
    token: env.ESKIZ_TOKENORG,
    group_id: env.ESKIZ_GROUP_ID,
};

export const bot = {
    token: env.BOT_TOKEN,
    admin: env.TELEGRAM_ADMIN,
    channel: env.TELEGRAM_CH,
};

export const company = {
    name: 'Baroka',
    url: 'baroka.uz/uz',
    crm_id: env.CRM_ID || 1112,
    crm_key: env.CRM_KEY || 'dae6355c-9da0-4fd3-8ed7-d14fcc23ab56',
    crm_address: env.CRM_ADDRESS || 'https://vipcrm.herokuapp.com/api',
};

export const origins = {
    origin1: env.APP_ALLOW_ORIGIN_1 || '',
    origin2: env.APP_ALLOW_ORIGIN_2 || '',
    origin3: env.APP_ALLOW_ORIGIN_3 || '',
    origin4: env.APP_ALLOW_ORIGIN_4 || '',
    origin5: env.APP_ALLOW_ORIGIN_5 || '',
    origin6: env.APP_ALLOW_ORIGIN_6 || '',
    origin7: env.APP_ALLOW_ORIGIN_7 || '',
    origin8: env.APP_ALLOW_ORIGIN_8 || '',
};

export const main_url = env.MAIN_URL;

export const aws = {
    bucket: env.AWS_BUCKET_NAME,
    accessKeyId: env.AWS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
};
