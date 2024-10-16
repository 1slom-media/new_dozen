export interface ProductImage {
    image: {
        '800': {
            high: string;
            low: string;
        };
        '720': {
            high: string;
            low: string;
        };
        '540': {
            high: string;
            low: string;
        };
        '240': {
            high: string;
            low: string;
        };
        '80': {
            high: string;
            low: string;
        };
    };
    imageKey: string;
    color?: string;
    hasVerticalPhoto?: boolean;
}

export interface ICharacteristcs {
    title: { uz: string; ru: string; en: string };
    uid: number;
    values: {
        title: { uz: string; ru: string; en: string };
        uid: number;
        value: string;
        isColor: boolean;
        sku: string;
        charId: number;
    }[];
}

export interface IProduct {
    uid?: number;
    title?: { uz: string; ru: string; en: string };
    seller?:any; 
    admin?:any; 
    category?: number;
    description?: { uz: string; ru: string; en: string };
    blocked?: boolean;
    blockingReason?: string;
    images?: ProductImage[];
    allowMarket?: boolean;
    adult?: boolean;
    characteristics?: ICharacteristcs[];
    positions?: string[];
    brand?: number;
    madeIn?: string;
    rating?: number;
    reviewsAmount?: number;
    discountBadges?: number[];
    video?: string;
    featureDescription?: { uz: string; ru: string; en: string };
    sizesDescription?: { uz: string; ru: string; en: string };
    sku?: string;
}
