export interface BotSettings {
    user: any;
    ready?: boolean;
    onway?: boolean;
    delivered?: boolean;
    canceled?: boolean;
    pending?: boolean;
    hold?: boolean;
    archived?: boolean;
    payment?: boolean;
    new_product?: boolean;
    new_order?: boolean;
    update_product?: boolean;
}

export interface EditBotSettings {
    ready?: boolean;
    onway?: boolean;
    delivered?: boolean;
    canceled?: boolean;
    pending?: boolean;
    hold?: boolean;
    archived?: boolean;
    payment?: boolean;
    new_order?: boolean;
    new_product?: boolean;
    update_product?: boolean;
}
