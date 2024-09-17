import mongoose from 'mongoose';
import { ISku } from '../interface/sku.interface';
import AutoIncrementFactory from 'mongoose-sequence';
const AutoIncrement = AutoIncrementFactory(mongoose);

const skuSchema = new mongoose.Schema<ISku>({
    productId: { type: Number, required: true },
    characteristics: [{ uid: { type: Number }, charId: { type: Number } }],
    characteristicsTitle: { type: String },
    skuTitle: { type: String },
    fullPrice: { type: Number, default: 0 },
    availableAmount: { type: Number, default: 0 },
    boughtPrice: { type: Number, default: 0 },
    referalPrice: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    barcode: { type: Number },
    quantityActive: { type: Number, default: 0 },
    quantityArchived: { type: Number, default: 0 },
    quantitySold: { type: Number, default: 0 },
    quantityCreated: { type: Number, default: 0 },
    blocked: { type: Boolean, default: false },
    allowMarket: { type: Boolean, default: false },
    uid: { type: Number },
});

skuSchema.plugin(AutoIncrement, {
    id: 'sku_counter',
    inc_field: 'uid',
    start_seq: 10000,
});

skuSchema.plugin(AutoIncrement, {
    id: 'barcode_counter',
    inc_field: 'barcode',
    start_seq: 1001000000000,
});

export const SkuModel = mongoose.model<ISku>('sku', skuSchema);
