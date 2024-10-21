export interface ISku {
    productId: number;
    uid?: number;
    characteristics?: { uid: number; charId: number }[];
    availableAmount?: number;
    fullPrice?: number;
    purchasePrice?: number;
    boughtPrice?: number;
    referalPrice?: number;
    sellerPrice?:number;
    operatorPrice?:number;
    adminPrice?:number;
    discountPrice?: number;
    barcode?: number;
    characteristicsTitle?: string;
    skuTitle?: string;
    quantitySold?: number;
    quantityArchived?: number;
    quantityCreated?: number;
    quantityActive?: number;
    blocked?: boolean;
    allowMarket?: boolean;
}

export interface IUpdateSku {
    uid?: number;
    productId?: number;
    availableAmount?: number;
    fullPrice?: number;
    purchasePrice?: number;
    boughtPrice?: number;
    referalPrice?: number;
    sellerPrice?:number;
    adminPrice?:number;
    operatorPrice?:number;
    discountPrice?: number;
    quantitySold?: number;
    blocked?: boolean;
    allowMarket?: boolean;
    skuTitle?: string;
}
