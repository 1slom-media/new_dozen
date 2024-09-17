import UserDao from '../user/dao/user.dao';
import OrderDao from '../order/dao/order.dao';
import SecurityDao from './dao/security.dao';

export default class SecurityService {
    private securityDao = new SecurityDao();
    private ordersDao = new OrderDao();
    private usersDao = new UserDao();

    async create(ip: string) {
        const foundSession = await this.securityDao.findOne(ip);

        if (!foundSession) return await this.securityDao.create(ip);
    }

    async getAll(page: number, limit: number) {
        return await this.securityDao.getAll(page, limit);
    }

    async getStatus(ip: string) {
        const foundSession = await this.securityDao.findOne(ip);

        if (!foundSession) await this.securityDao.create(ip);

        const c1 = await this.ordersDao.findOrdersLast24HoursByUserIp(ip);

        if (c1 > 5) return false;

        const c2 = await this.usersDao.getByIPDuringOneDay(ip);

        if (c2 > 5) return false;
        return true;
    }
}
