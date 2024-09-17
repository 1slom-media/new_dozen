import mongoose from 'mongoose';
import { ICard } from '../interface/cards.interface';
import { CardModel } from '../model/cards.model';
import { UpdateCardDto } from '../dto/cards.dto';

export class CardDao {
    async create(values: ICard) {
        const card = new CardModel(values);
        return await card.save();
    }

    async getAll(userId: string) {
        return await CardModel.find({
            userId: new mongoose.Types.ObjectId(userId),
        });
    }

    async update(userId: string, cardId: string, values: UpdateCardDto) {
        return await CardModel.findOneAndUpdate(
            { userId, _id: cardId },
            values,
            { new: true }
        );
    }

    async findOne(userId: string, cardId: string) {
        return await CardModel.findOne({ _id: cardId, userId });
    }

    async delete(userId: string, cardId: string) {
        return await CardModel.findOneAndDelete({ userId, _id: cardId });
    }
}
