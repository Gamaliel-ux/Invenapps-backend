import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
export declare class StockMovementsController {
    private readonly stockMovementsService;
    constructor(stockMovementsService: StockMovementsService);
    create(dto: CreateStockMovementDto, req: any): Promise<{
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
    }>;
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
