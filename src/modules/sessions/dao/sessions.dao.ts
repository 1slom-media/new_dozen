import mongoose from 'mongoose';
import { ISession } from '../interface/sessions.interface';
import { SessionModel } from '../model/sessions.model';

export default class SessionsDao {
    async create(values: ISession) {
        const session = await new SessionModel(values);

        return session.save();
    }

    async getSessions(id: string) {
        return await SessionModel.find({
            user: new mongoose.Types.ObjectId(id),
        });
    }
}
