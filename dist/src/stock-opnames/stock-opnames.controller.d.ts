import { StockOpnamesService } from './stock-opnames.service';
import { CreateStockOpnameDto } from './dto/create-stock-opname.dto';
export declare class StockOpnamesController {
    private readonly stockOpnamesService;
    constructor(stockOpnamesService: StockOpnamesService);
    create(dto: CreateStockOpnameDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        user: string;
        code: string;
        status: import("@prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        systemQuantity: number;
        physicalQuantity: number;
        difference: number;
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
        code: string;
        status: import("@prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        systemQuantity: number;
        physicalQuantity: number;
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
            purchasePrice: number;
            sellingPrice: number;
            stock: number;
            minStock: number;
            unit: string;
            isDeleted: boolean;
            categoryId: string;
            supplierId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        user: string;
        code: string;
        status: import("@prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        systemQuantity: number;
        physicalQuantity: number;
        difference: number;
    }>;
    adjust(id: string, req: any): Promise<{
        product: {
            id: string;
            createdAt: Date;
            name: string;
            sku: string;
            barcode: string;
            description: string;
            purchasePrice: number;
            sellingPrice: number;
            stock: number;
            minStock: number;
            unit: string;
            isDeleted: boolean;
            categoryId: string;
            supplierId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        user: string;
        code: string;
        status: import("@prisma/client").$Enums.OpnameStatus;
        notes: string | null;
        productId: string;
        systemQuantity: number;
        physicalQuantity: number;
        difference: number;
    }>;
}
