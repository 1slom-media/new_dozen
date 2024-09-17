import TokenService from './providers/token.service';
import { ISignIn, ISignUp, ITokenPayload } from './interface/auth.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import { compareHash } from '../shared/utils/bcrypt';
import UserService from '../user/user.service';
import { sendSms } from '../shared/utils/sendSms';
import BotSettingsService from '../botSettings/botSettings.service';
import {
    sendBlockedUser,
    sendBlockedUserManySms,
} from '../shared/utils/sendMessage';
import SessionsService from '../sessions/sessions.service';

export default class AuthService {
    private jwtService = new TokenService();
    private userService = new UserService();
    private botSettings = new BotSettingsService();
    private sessionsService = new SessionsService();

    async SignWithPhone(phone: string, name?: string, ip?: string) {
        try {
            const user = await this.userService.findOneForAuth(phone);

            if (user?.status === 0) {
                throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
            }

            var newCode: string = '';
            while (newCode.length < 4) {
                let randomNumber = Math.floor(Math.random() * 10);
                if (randomNumber !== 0) {
                    newCode += randomNumber;
                }
            }

            const newUser = await this.userService.create({
                phone,
                name,
                smsCode: Number(newCode),
                ip,
            });

            await sendSms(
                `Baroka.uz sayti uchun birmartalik tasdiqlash kodi - ${newCode}`,
                phone
            ).catch((err) => {
                if (err) return { message: err.message };
            });

            setTimeout(async () => {
                if (newUser?._id)
                    await this.userService.update(newUser?._id, {
                        smsCode: Math.floor(Math.random() * 100000),
                    });
            }, 120000);

            setTimeout(async () => {
                if (newUser?._id)
                    await this.userService.update(newUser?._id, {
                        countSendedSms: 0,
                    });
            }, 600000);

            const updatedUser = await this.userService.update(newUser?._id, {
                countSendedSms: newUser?.countSendedSms + 1,
            });

            if (updatedUser.countSendedSms === 3) {
                await this.userService.update(user?._id, {
                    status: 0,
                });

                const admins = await this.botSettings.getAllUsers(true);

                admins.forEach(async (admin) => {
                    await sendBlockedUserManySms(
                        admin?.telegramID,
                        updatedUser
                    );
                });
            }
            return { message: 'Raqmingizga sms kod yuborildi!' };
        } catch (err) {
            throw new ErrorResponse(500, err.message);
        }
    }

    async SendCode(phone: string) {
        const user = await this.userService.findOneForAuth(phone);

        if (user?.status === 0) {
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
        }

        var newCode: string = '';
        while (newCode.length < 4) {
            let randomNumber = Math.floor(Math.random() * 10);
            if (randomNumber !== 0) {
                newCode += randomNumber;
            }
        }

        const newUser = await this.userService.update(user._id, {
            smsCode: Number(newCode),
        });

        await sendSms(
            `Baroka.uz sayti uchun birmartalik tasdiqlash kodi - ${newCode}`,
            phone
        ).catch((err) => {
            if (err) return { message: err.message };
        });

        setTimeout(async () => {
            if (newUser?._id)
                await this.userService.update(newUser?._id, {
                    smsCode: Math.floor(Math.random() * 100000),
                });
        }, 120000);

        return { message: 'Tasdiqlash kodi yuborildi!' };
    }

    async CheckPhoneNumber(phone: string, code: number) {
        const user = await this.userService.findOneForAuth(phone);

        if (user?.status === 0) {
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
        }

        if (Number(user.smsCode) !== Number(code))
            throw new ErrorResponse(
                400,
                'Kod xato, tekshirib qaytadan kiriting'
            );

        return { message: 'Profile tasdiqlandi' };
    }

    async ResetPhoneNumber(oldPhoneNumber: string, phone: string) {
        const user = await this.userService.findOneForAuth(oldPhoneNumber);

        var newCode: string = '';
        while (newCode.length < 4) {
            let randomNumber = Math.floor(Math.random() * 10);
            if (randomNumber !== 0) {
                newCode += randomNumber;
            }
        }

        const newUser = await this.userService.update(user._id, {
            smsCode: Number(newCode),
        });

        const foundUser = await this.userService.findOneForAuth(phone);

        if (foundUser)
            throw new ErrorResponse(
                400,
                'Bunday raqamli profil allaqachon mavjud'
            );
        await sendSms(`Baroka.uz sayti uchun birmartalik tasdiqlash kodi - ${newCode}`, phone);

        setTimeout(async () => {
            if (newUser?._id)
                await this.userService.update(newUser?._id, {
                    smsCode: Math.floor(Math.random() * 100000),
                });
        }, 120000);

        return { message: 'Tasdiqlash kodi yuborildi!' };
    }

    async UpdatePhoneNumber(
        oldPhoneNumber: string,
        phone: string,
        code: number
    ) {
        const user = await this.userService.findOneForAuth(oldPhoneNumber);

        if (Number(user.smsCode) !== Number(code))
            throw new ErrorResponse(
                400,
                'Kod xato, tekshirib qaytadan kiriting!'
            );

        await this.userService.update(user._id, { phone });

        return { message: 'Raqam muvaffaqqiyatli tahrirlandi!' };
    }

    async SignWithPhoneAdmin(phone: string) {
        const operator = await this.userService.findOneForAuth(phone);
        if (operator && !operator.isAdmin)
            throw new ErrorResponse(400, 'Siz admin emas ekansiz!');

        if (operator?.status === 0) {
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
        }

        var newCode: string = '';
        while (newCode.length < 4) {
            let randomNumber = Math.floor(Math.random() * 10);
            if (randomNumber !== 0) {
                newCode += randomNumber;
            }
        }

        const user = await this.userService.findOneForAuth(phone);
        if (!user) {
            await this.userService.create({
                phone,
                smsCode: Number(newCode),
            });
        } else
            await this.userService.update(user._id, {
                smsCode: Number(newCode),
            });
        await sendSms(`Baroka.uz sayti uchun birmartalik tasdiqlash kodi - ${newCode}`, phone);

        setTimeout(async () => {
            await this.userService.update(user._id, {
                smsCode: Math.floor(Math.random() * 100000),
            });
        }, 120000);
        return { message: 'Raqmingizga sms kod yuborildi!' };
    }

    async CheckCode(
        phone: string,
        code: number,
        device?: string,
        browser?: string,
        ip?: string
    ) {
        const user = await this.userService.findOneForAuth(phone);
        console.log(user);
        if (!user) throw new ErrorResponse(400, 'Bu raqamli foydalanuvchi yoq');
        if (user?.status == 0) {
            throw new ErrorResponse(400, 'Sizning raqamingiz bloklangan!');
        }

        if (Number(user.smsCode) !== Number(code)) {
            if (user?.countSentCode == 1) {
                await this.userService.update(user._id, {
                    countSentCode: user?.countSentCode + 1,
                });
                throw new ErrorResponse(
                    400,
                    `Kod xato, oxirgi urunish qoldi aks holda bloklanasiz`
                );
            }
            await this.userService.update(user._id, {
                countSentCode: user?.countSentCode
                    ? user?.countSentCode + 1
                    : 1,
            });
            if (user?.countSentCode == 2) {
                const updatedUser = await this.userService.update(user._id, {
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

        await this.userService.update(user._id, {
            isPhoneActive: true,
            countSentCode: 0,
        });

        await this.sessionsService.create({
            user: user._id,
            device,
            browser,
            ip,
        });

        const accessTokenPayload: ITokenPayload = { user_id: user['_id'] };

        const accessToken = this.jwtService.getAccessToken(accessTokenPayload);

        return {
            token: accessToken,
            isAdmin: user.isAdmin,
            status: user.status,
        };
    }
}
