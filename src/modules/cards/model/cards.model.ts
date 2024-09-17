import { ICard } from '../interface/cards.interface';
import mongoose from 'mongoose';

const cardsSchema = new mongoose.Schema<ICard>({
    card: { type: String, required: true },
    name: { type: String, required: true },
    expireDate: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true },
});

export const CardModel = mongoose.model<ICard>('cards', cardsSchema);
