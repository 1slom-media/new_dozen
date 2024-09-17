import SessionsDao from './dao/sessions.dao';
import { ISession } from './interface/sessions.interface';

export default class SessionsService {
    private sessionsDao = new SessionsDao();

    async create(values: ISession) {
        return await this.sessionsDao.create(values);
    }

    async getSessions(id: string) {
        return await this.sessionsDao.getSessions(id);
    }
}
