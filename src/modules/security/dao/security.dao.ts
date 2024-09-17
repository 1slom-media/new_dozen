import { SecurityModel } from '../model/security.model';
export default class SecurityDao {
    async create(ip: string) {
        const newSession = new SecurityModel({ ip });

        return await newSession.save();
    }

    async findOne(ip: string) {
        const foundSession = await SecurityModel.findOne({ ip });

        return foundSession;
    }

    async getAll(page: number, limit: number) {
        const countPage = await SecurityModel.find().count();

        const sessions = await SecurityModel.find()
            .skip((page - 1) * limit)
            .limit(limit);

        return { countPage: Math.ceil(countPage / limit), sessions };
    }
}
