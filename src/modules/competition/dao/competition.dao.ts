import { UpdateCompetitionDto } from '../dto/competition.dto';
import { ICompetition } from '../interface/competition.interface';
import { CompetitionModel } from '../model/competition.model';

export default class CompetitionDao {
    async create({ content, endTime, name, startTime, banner }: ICompetition) {
        const competition = new CompetitionModel({
            name,
            banner,
            content,
            startTime,
            endTime,
        });
        competition.save();

        return competition;
    }

    async getAll() {
        return await CompetitionModel.find();
    }

    async getById(competitionId: string) {
        return await CompetitionModel.findById(competitionId);
    }

    async update(competitionId: string, values: UpdateCompetitionDto) {
        const competition = await CompetitionModel.findByIdAndUpdate(
            competitionId,
            values,
            { new: true }
        );
        return competition;
    }

    async delete(competitionId: string) {
        const product = await CompetitionModel.deleteOne({
            _id: competitionId,
        });

        return product;
    }
}
