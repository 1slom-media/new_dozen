export interface IUser {
    _id?: string;
    phone?: string;
    name?: string;
    surname?: string;
    nickname?: string;
    email?: string;
    isAdmin?: boolean;
    balance?: number;
    deposit?: number;
    paid?: number;
    avatar?: string;
    status?: number;
    region?: number;
    soldProCount?: number;
    telegramID?: number;
    isOperator?: boolean;
    isBotActive?: boolean;
    banner?: string;
    isPhoneActive?: boolean;
    smsCode?: number;
    uid?: number;
    bitcoin?: number;
    chats?: string[];
    countSentCode?: number;
    countSendedSms?: number;
    ip?: string;
}
