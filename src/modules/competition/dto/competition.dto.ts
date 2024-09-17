import { ICompetition } from '../interface/competition.interface';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateCompetitionDto implements ICompetition {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    content: string;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    startTime: Date;

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    endTime: Date;

    @IsString()
    banner: string;
}

export class UpdateCompetitionDto implements ICompetition {
    @IsString()
    name: string;

    @IsString()
    content: string;

    @IsString()
    startTime: Date;

    @IsString()
    endTime: Date;

    @IsString()
    @IsNotEmpty()
    banner: string;

    @IsString()
    isEmpty: boolean;

    @IsString()
    status: number;
}
