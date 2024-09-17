export interface IComment {
    productId: any;
    user?: any;
    rating: number;
    text: string;
    isReply?: boolean;
    isAdmin?: boolean;
    replies?: IComment[];
    images?: string[];
}
