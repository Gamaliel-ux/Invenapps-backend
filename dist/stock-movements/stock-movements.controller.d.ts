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
        user: string;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        notes: string | null;
        quantity: number;
        productId: string;
    }>;
    findAll(): Promise<({
        product: {
            name: string;
            sku: string;
            unit: string;
        };
    } & {
        user: string;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        notes: string | null;
        quantity: number;
        productId: string;
    })[]>;
    findByProduct(productId: string): Promise<{
        user: string;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        notes: string | null;
        quantity: number;
        productId: string;
    }[]>;
}
