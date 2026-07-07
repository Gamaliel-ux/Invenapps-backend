import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dto/update-po-status.dto';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(dto: CreatePurchaseOrderDto, req: any): Promise<{
        items: {
            id: string;
            quantity: number;
            productId: string;
            price: number;
            purchaseOrderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        supplierId: string;
        code: string;
        totalValue: number;
        status: import(".prisma/client").$Enums.POStatus;
        notes: string | null;
        approvedBy: string | null;
        receivedBy: string | null;
    }>;
    findAll(): Promise<({
        supplier: {
            name: string;
        };
        items: ({
            product: {
                name: string;
                sku: string;
            };
        } & {
            id: string;
            quantity: number;
            productId: string;
            price: number;
            purchaseOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        supplierId: string;
        code: string;
        totalValue: number;
        status: import(".prisma/client").$Enums.POStatus;
        notes: string | null;
        approvedBy: string | null;
        receivedBy: string | null;
    })[]>;
    findOne(id: string): Promise<{
        supplier: {
            id: string;
            createdAt: Date;
            name: string;
            contact: string | null;
            phone: string | null;
            address: string | null;
        };
        items: ({
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
            id: string;
            quantity: number;
            productId: string;
            price: number;
            purchaseOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        supplierId: string;
        code: string;
        totalValue: number;
        status: import(".prisma/client").$Enums.POStatus;
        notes: string | null;
        approvedBy: string | null;
        receivedBy: string | null;
    }>;
    updateStatus(id: string, dto: UpdatePOStatusDto, req: any): Promise<{
        supplier: {
            id: string;
            createdAt: Date;
            name: string;
            contact: string | null;
            phone: string | null;
            address: string | null;
        };
        items: ({
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
            id: string;
            quantity: number;
            productId: string;
            price: number;
            purchaseOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        supplierId: string;
        code: string;
        totalValue: number;
        status: import(".prisma/client").$Enums.POStatus;
        notes: string | null;
        approvedBy: string | null;
        receivedBy: string | null;
    }>;
}
