import { MovementType } from '@prisma/client';
export declare class CreateStockMovementDto {
    productId: string;
    type: MovementType;
    quantity: number;
    notes?: string;
}
