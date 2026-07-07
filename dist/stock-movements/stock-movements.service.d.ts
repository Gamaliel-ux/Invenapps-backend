import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductsService } from '../products/products.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class StockMovementsService {
    private prisma;
    private productsService;
    private auditLogs;
    constructor(prisma: PrismaService, productsService: ProductsService, auditLogs: AuditLogsService);
    create(dto: CreateStockMovementDto, reqUser: any): Promise<{
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
