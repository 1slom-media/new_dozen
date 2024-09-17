import mongoose from 'mongoose';
import { ICompetition } from '../interface/competition.interface';

const competitionSchema = new mongoose.Schema<ICompetition>(
    {
        name: {
            type: String,
            required: [true, 'Konkursni nomini kiriting'],
        },
        banner: {
            type: String,
            required: [true, 'Bannerni kiriting'],
        },
        content: {
            type: String,
            required: [true, 'Kontentni kiriting'],
        },
        startTime: {
            type: Date,
            required: [true, 'Boshlash vaqtini kiritishingiz kerak'],
        },
        endTime: {
            type: Date,
            required: [true, 'Tugash vaqtini kiritishingiz kerak'],
        },
        isEmpty: { type: Boolean, default: false },
        status: { type: Number, default: 1 },
    },
    {
        timestamps: true,
    }
);

export const CompetitionModel = mongoose.model<ICompetition>(
    'konkurs',
    competitionSchema
);
