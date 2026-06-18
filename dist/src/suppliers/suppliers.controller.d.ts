import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(dto: CreateSupplierDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        contact: string | null;
        phone: string | null;
        address: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            products: number;
            PurchaseOrders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        contact: string | null;
        phone: string | null;
        address: string | null;
    })[]>;
    findOne(id: string): Promise<{
        products: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        contact: string | null;
        phone: string | null;
        address: string | null;
    }>;
    update(id: string, dto: CreateSupplierDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        contact: string | null;
        phone: string | null;
        address: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
