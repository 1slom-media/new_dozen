import ErrorResponse from '../shared/utils/errorResponse';
import { CardDao } from './dao/cards.dao';
import { UpdateCardDto } from './dto/cards.dto';
import { ICard } from './interface/cards.interface';

export class CardService {
    private cardDao = new CardDao();

    async create(values: ICard) {
        return await this.cardDao.create(values);
    }

    async getAll(userId: string) {
        return await this.cardDao.getAll(userId);
    }

    async getOne(userId: string, cardId: string) {
        const card = await this.cardDao.findOne(userId, cardId);

        if (!card) throw new ErrorResponse(404, 'Karta topilmadi!');
        return card;
    }

    async update(userId: string, cardId: string, values: UpdateCardDto) {
        await this.getOne(userId, cardId);

        return await this.cardDao.update(userId, cardId, values);
    }

    async delete(userId: string, cardId: string) {
        await this.getOne(userId, cardId);

        return await this.cardDao.delete(userId, cardId);
    }
}
