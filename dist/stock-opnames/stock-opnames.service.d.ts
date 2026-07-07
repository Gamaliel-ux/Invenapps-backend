import { PrismaService } from '../prisma/prisma.service';
import { CreateStockOpnameDto } from './dto/create-stock-opname.dto';
import { ProductsService } from '../products/products.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class StockOpnamesService {
    private prisma;
    private productsService;
    private auditLogs;
    constructor(prisma: PrismaService, productsService: ProductsService, auditLogs: AuditLogsService);
    create(dto: CreateStockOpnameDto, reqUser: any): Promise<{
        user: string;
        id: string;
        createdAt: Date;
        code: string;
        status: import(".prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        physicalQuantity: number;
        systemQuantity: number;
        difference: number;
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
        code: string;
        status: import(".prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        physicalQuantity: number;
        systemQuantity: number;
        difference: number;
    })[]>;
    findOne(id: string): Promise<{
        product: {
            id: string;
            createdAt: Date;
            name: string;
            sku: string;
            barcode: string;
            description: string;
            categoryId: string;
            supplierId: string | null;
            purchasePrice: number;
            sellingPrice: number;
            stock: number;
            minStock: number;
            unit: string;
            isDeleted: boolean;
        };
    } & {
        user: string;
        id: string;
        createdAt: Date;
        code: string;
        status: import(".prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        physicalQuantity: number;
        systemQuantity: number;
        difference: number;
    }>;
    adjust(id: string, reqUser: any): Promise<{
        product: {
            id: string;
            createdAt: Date;
            name: string;
            sku: string;
            barcode: string;
            description: string;
            categoryId: string;
            supplierId: string | null;
            purchasePrice: number;
            sellingPrice: number;
            stock: number;
            minStock: number;
            unit: string;
            isDeleted: boolean;
        };
    } & {
        user: string;
        id: string;
        createdAt: Date;
        code: string;
        status: import(".prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        physicalQuantity: number;
        systemQuantity: number;
        difference: number;
    }>;
}
