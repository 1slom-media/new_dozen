export interface ISms {
    ready?: boolean;
    onway?: boolean;
    delivered?: boolean;
    canceled?: boolean;
    pending?: boolean;
    hold?: boolean;
    archived?: boolean;
    fulfilled?: boolean;
    rejected?: boolean;
    new_payment?: boolean;
}
