export enum Sorting {
    'price',
    'rating',
    'date',
}

export enum Odrering {
    'ascending',
    'descending',
}

export interface IDefaultQuery {
    page?: number;
    limit?: number;
    from?: number;
    to?: number;
    status?: string;
    userId?: string;
    type?: string;
    phone?: string;
    name?: string;
    startTime?: Date;
    endTime?: Date;
    category?: number;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    brand?: string;
    sorting?: string;
    ordering?: string;
}

export interface ISearchQuery extends IDefaultQuery {
    filter?: string;
}
