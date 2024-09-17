import RequestDao from './dao/request.dao';

export default class RequestService {
    private requestDao = new RequestDao();

    async getAll(
        id: string,
        page: number,
        status: string,
        from?: number,
        to?: number
    ) {
        const requests = await this.requestDao.getAll(
            id,
            page,
            status,
            from,
            to
        );

        return requests;
    }

    async getByOrderId(id: string) {
        return await this.requestDao.getByOrderId(id);
    }

    async create(id: string, msg: string) {
        return await this.requestDao.create(id, msg);
    }

    async findAndUpdate(id: string, msg: string) {
        return await this.requestDao.findAndUpdate(id, msg);
    }
}
