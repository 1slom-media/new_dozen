export interface IPayment {
    user?: any;
    card: string;
    amount: number;
    message?: string;
    status?: string;
    uid?: number;
}
