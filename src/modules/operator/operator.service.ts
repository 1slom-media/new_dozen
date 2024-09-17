import { UpdateUserDto } from '../user/dto/user.dto';
import UserService from '../user/user.service';
import { ISignIn, ITokenPayload } from '../auth/interface/auth.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import { compareHash } from '../shared/utils/bcrypt';
import TokenService from '../auth/providers/token.service';
import { sendSms } from '../shared/utils/sendSms';
import {
    sendBlockedUser,
    sendBlockedUserManySms,
} from '../shared/utils/sendMessage';
import BotSettingsService from '../botSettings/botSettings.service';

export default class OperatorService extends UserService {
    private jwtService = new TokenService();
    private botSettings = new BotSettingsService();

    async updateProfile(user: string, values: UpdateUserDto) {
        return await this.update(user, values);
    }

    async SignWithPhone(phone: string) {
        const operator = await this.findOneForAuth(phone);

        if (!operator || !operator.isOperator)
            throw new ErrorResponse(400, 'Siz operator emas siz!');

        if (operator.status === 0) {
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
        }
        var newCode: string = '';
        while (newCode.length < 4) {
            let randomNumber = Math.floor(Math.random() * 10);
            if (randomNumber !== 0) {
                newCode += randomNumber;
            }
        }
        await this.create({
            phone,
            smsCode: Number(newCode),
        });
        await sendSms(`Baroka.uz sayti uchun birmartalik tasdiqlash kodi - ${newCode}`, phone);

        setTimeout(async () => {
            await this.update(operator._id, {
                smsCode: Math.floor(Math.random() * 100000),
            });
        }, 120000);

        setTimeout(async () => {
            if (operator?._id)
                await this.update(operator?._id, {
                    countSendedSms: 0,
                });
        }, 600000);

        const updatedUser = await this.update(operator?._id, {
            countSendedSms: operator?.countSendedSms + 1,
        });

        if (updatedUser.countSendedSms === 3) {
            await this.update(operator?._id, {
                status: 0,
            });

            const admins = await this.botSettings.getAllUsers(true);

            admins.forEach(async (admin) => {
                await sendBlockedUserManySms(admin?.telegramID, updatedUser);
            });
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklandi!');
        }

        return { message: 'Raqmingizga sms kod yuborildi!' };
    }

    async CheckCode(phone: string, code: number) {
        const user = await this.findOneForAuth(phone);
        if (user?.status === 0) {
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
        }

        if (Number(user.smsCode) !== Number(code)) {
            if (user?.countSentCode == 1) {
                await this.update(user._id, {
                    countSentCode: user?.countSentCode + 1,
                });
                throw new ErrorResponse(
                    400,
                    `Kod xato, oxirgi urunish qoldi aks holda bloklanasiz`
                );
            }
            await this.update(user._id, {
                countSentCode: user?.countSentCode
                    ? user?.countSentCode + 1
                    : 1,
            });
            if (user?.countSentCode == 2) {
                const updatedUser = await this.update(user._id, {
                    status: 0,
                    countSentCode: 0,
                });

                const admins = await this.botSettings.getAllUsers(true);

                admins.forEach(async (admin) => {
                    await sendBlockedUser(admin?.telegramID, updatedUser);
                });

                throw new ErrorResponse(
                    400,
                    `Kod xato, sizning raqamingiz bloklandi!`
                );
            }
            throw new ErrorResponse(400, `Kod xato, tekshirib qaytadan tering`);
        }

        await this.update(user._id, { isPhoneActive: true, countSentCode: 0 });

        const accessTokenPayload: ITokenPayload = { user_id: user['_id'] };

        const accessToken = this.jwtService.getAccessToken(accessTokenPayload);

        return {
            token: accessToken,
            user,
        };
    }
}
