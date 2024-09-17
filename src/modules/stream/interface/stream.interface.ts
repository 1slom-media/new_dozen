export interface IStream {
    name: string;
    product: number;
    _id?: string;
    number?: number;
    user?: any;
    visits_count?: number;
    // new?: number;
    // ready?: number;
    // onway?: number;
    // delivered?: number;
    // canceled?: number;
    // hold?: number;
    // archived?: number;
    isRegionOn?: boolean;
    isDeleted?: boolean;
    pending?: number;
}
