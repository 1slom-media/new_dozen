import UserService from '../user/user.service';
import ErrorResponse from '../shared/utils/errorResponse';
import CompetitionDao from './dao/competition.dao';
import { UpdateCompetitionDto } from './dto/competition.dto';
import { ICompetition } from './interface/competition.interface';
import OrderService from '../order/order.service';

export default class CompetitionService {
    private competitionDao = new CompetitionDao();
    private ordersService = new OrderService();

    async create({ name, content, endTime, startTime, banner }: ICompetition) {
        const competition = await this.competitionDao.create({
            name,
            content,
            endTime,
            startTime,
            banner,
        });

        return competition;
    }

    async getAll() {
        const allKonkurs = await this.competitionDao.getAll();

        return { competitions: allKonkurs };
    }

    async findOne(id: string) {
        const foundCompetition: ICompetition =
            await this.competitionDao.getById(id);

        if (!foundCompetition) {
            throw new ErrorResponse(404, 'Bunday konkurs mavjud emas!');
        }

        if (foundCompetition) {
            let users = [];
            users = await this.ordersService.getUsersForCompetition(
                foundCompetition.startTime,
                foundCompetition.endTime
            );

            return {
                users,
                konkurs: foundCompetition,
                status: foundCompetition.status,
                isEmpty: foundCompetition.isEmpty,
            };
        }

        return foundCompetition;
    }

    async update(id: string, values: UpdateCompetitionDto) {
        const foundCompetition: ICompetition =
            await this.competitionDao.getById(id);

        if (!foundCompetition) {
            throw new ErrorResponse(404, 'Bunday konkurs topilmadi!');
        }

        return await this.competitionDao.update(id, values);
    }

    async delete(id: string) {
        const foundCompetition: ICompetition =
            await this.competitionDao.getById(id);

        if (!foundCompetition) {
            throw new ErrorResponse(404, 'Bunday konkurs topilmadi!');
        }

        return await this.competitionDao.delete(id);
    }
}
