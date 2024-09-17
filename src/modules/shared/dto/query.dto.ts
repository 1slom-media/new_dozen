import {
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumberString,
    IsString,
} from 'class-validator';
import {
    IDefaultQuery,
    ISearchQuery,
    Odrering,
    Sorting,
} from '../interface/query.interface';

export class DefaultQueryDTO implements IDefaultQuery {
    @IsNumberString()
    page?: number;

    @IsNumberString()
    limit?: number;

    @IsNumberString()
    from?: number;

    @IsNumberString()
    to?: number;

    @IsString()
    status?: string;

    @IsString()
    userId?: string;

    @IsString()
    type?: string;

    @IsString()
    name?: string;

    @IsString()
    phone?: string;

    @IsString()
    @IsEnum(Odrering)
    ordering?: string;

    @IsString()
    @IsEnum(Sorting)
    sorting?: string;

    @IsString()
    brand?: string;

    @IsString()
    color?: string;

    @IsNumberString()
    maxPrice?: number;

    @IsNumberString()
    minPrice?: number;

    @IsNumberString()
    region?: string;
}

export class SearchQueryDTO extends DefaultQueryDTO implements ISearchQuery {
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    filter: string;
}
