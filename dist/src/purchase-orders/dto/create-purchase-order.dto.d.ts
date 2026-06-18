import { POStatus } from '@prisma/client';
declare class PurchaseOrderItemDto {
    productId: string;
    quantity: number;
    price: number;
}
export declare class CreatePurchaseOrderDto {
    code: string;
    supplierId: string;
    items: PurchaseOrderItemDto[];
    status?: POStatus;
    notes?: string;
}
export {};
