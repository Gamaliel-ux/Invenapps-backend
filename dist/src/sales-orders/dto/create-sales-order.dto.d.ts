import { SOStatus } from '@prisma/client';
declare class SalesOrderItemDto {
    productId: string;
    quantity: number;
    price: number;
}
export declare class CreateSalesOrderDto {
    code: string;
    customerId: string;
    items: SalesOrderItemDto[];
    status?: SOStatus;
    notes?: string;
}
export {};
