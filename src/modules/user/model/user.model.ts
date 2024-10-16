import mongoose from 'mongoose';
import { IUser } from '../interface/user.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, default: 'Foydalanuvchi' },
        phone: {
            type: String,
            required: [true, 'Telefon raqamingizni kiriting'],
            unique: true,
        },
        isPhoneActive: { type: Boolean, required: true, default: false },
        smsCode: {
            type: Number,
        },
        isAdmin: { type: Boolean, required: true, default: false },
        balance: { type: Number, default: 0 },
        deposit: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
        avatar: {
            type: String,
            default:
                'https://res.cloudinary.com/dk4ebdhyj/image/upload/v1667304992/Images/zpcbd2ueyhlhkzyicdo1.png',
        },
        status: {
            type: Number,
            required: [true, 'Statusni kiriting'],
            default: 1,
        },
        region: {
            type: Number,
            default: 0,
        },
        surname: { type: String },
        nickname: { type: String },
        email: { type: String },
        soldProCount: { type: Number, default: 0 },
        telegramID: { type: Number },
        isOperator: { type: Boolean, default: false },
        isSeller: { type: Boolean, default: false },
        banner: { type: String },
        uid: { type: Number, unique: true },
        bitcoin: { type: Number, default: 0 },
        isBotActive: { type: Boolean, default: false },
        chats: [{ type: String }],
        countSentCode: { type: Number, default: 0 },
        countSendedSms: { type: Number, default: 0 },
        ip: { type: String },
    },
    {
        timestamps: true,
    }
);

userSchema.plugin(AutoIncrement, {
    id: 'user_counter',
    inc_field: 'uid',
    start_at: 100000,
    increment_by: 5,
});

userSchema.plugin(AutoIncrement, {
    id: 'tg_counter',
    inc_field: 'telegramID',
    start_at: 111111,
    increment_by: 5,
});

export const UserModel = mongoose.model<IUser>('users', userSchema);
