import ErrorResponse from '../shared/utils/errorResponse';
import UserDao from './dao/user.dao';
import { IUser } from './interface/user.interface';
import { UpdateUserDto } from './dto/user.dto';
import { generateHash } from '../shared/utils/bcrypt';

export default class UserService {
    private userDao = new UserDao();

    async create(userData: IUser) {
        const user: IUser = await this.userDao.cerate(userData);

        return user;
    }

    async getAll(
        operator: boolean,
        filter: string,
        page: number,
        limit: number
    ) {
        return this.userDao.getAll(operator, '-updatedAt', filter, page, limit);
    }

    async findOne(id: string, select?: string) {
        const foundUser: IUser = await this.userDao.findOne(id, select);

        if (!foundUser) {
            throw new ErrorResponse(404, 'Bunday foydalanuvchi mavjud emas!');
        }

        return foundUser;
    }

    async getOneWithOrder(id: string) {
        let orderCount = {
            new: 0,
            ready: 0,
            onway: 0,
            delivered: 0,
            canceled: 0,
            hold: 0,
            archived: 0,
        };
        const foundUser: IUser = await this.userDao.findOne(id);

        if (!foundUser) {
            throw new ErrorResponse(404, 'Bunday foydalanuvchi mavjud emas!');
        }

        // const userOrders = await this.orderService.getOrderWithUser();
        // userOrders.forEach((order) => {
        //     if (order.stream && order.stream.user == id) {
        //         orderCount[order.status] += 1;
        //     }
        // });

        // return { orderCount, user: foundUser };
    }

    async findOneForAuth(phone: string) {
        const foundUser: IUser = await this.userDao.findOneForAuth(phone);

        return foundUser;
    }

    async update(
        id: string,
        {
            status,
            name,
            phone,
            region,
            telegramID,
            avatar,
            smsCode,
            isBotActive,
            isAdmin,
            isOperator,
            isPhoneActive,
            paid,
            balance,
            banner,
            chats,
            soldProCount,
            countSentCode,
            countSendedSms,
            deposit,
            email,
            surname,
            nickname,
        }: UpdateUserDto
    ) {
        const foundUser: IUser = await this.userDao.findOne(id);

        if (!foundUser) {
            throw new ErrorResponse(404, 'Bunday foydalanuvchi topilmadi!');
        }

        return await this.userDao.update(id, {
            status,
            name,
            phone,
            region,
            telegramID,
            avatar,
            smsCode,
            isBotActive,
            isAdmin,
            isOperator,
            isPhoneActive,
            paid,
            balance,
            banner,
            chats,
            soldProCount,
            countSentCode,
            countSendedSms,
            deposit,
            email,
            surname,
            nickname,
        });
    }

    async delete(id: string) {
        const foundUser: IUser = await this.userDao.findOne(id);

        if (!foundUser) {
            throw new ErrorResponse(404, 'Bunday foydalanuvchi topilmadi!');
        }

        return await this.userDao.delete(id);
    }

    async searchGlobal(filter: string) {
        return await this.userDao.searchGlobal(filter);
    }

    async checkIfUserExists(id: number) {
        return await this.userDao.checkIfUserExists(id);
    }

    async getAllAdmins() {
        return await this.userDao.getAllAdmins();
    }

    async getExpoTokens() {
        return await this.userDao.getExpoTokens();
    }

    async getAllBalance() {
        return await this.userDao.getAllBalance();
    }
}
