import { PrismaService } from '../prisma/prisma.service';
export declare class StockMovementsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        product: {
            name: string;
            sku: string;
            unit: string;
        };
    } & {
        id: string;
        createdAt: Date;
        user: string;
        notes: string | null;
        quantity: number;
        productId: string;
        type: import("@prisma/client").$Enums.MovementType;
    })[]>;
    findByProduct(productId: string): Promise<{
        id: string;
        createdAt: Date;
        user: string;
        notes: string | null;
        quantity: number;
        productId: string;
        type: import("@prisma/client").$Enums.MovementType;
    }[]>;
}
