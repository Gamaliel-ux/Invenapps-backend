import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSOStatusDto } from './dto/update-so-status.dto';
export declare class SalesOrdersController {
    private readonly salesOrdersService;
    constructor(salesOrdersService: SalesOrdersService);
    create(dto: CreateSalesOrderDto, req: any): Promise<{
        items: {
            id: string;
            quantity: number;
            price: number;
            productId: string;
            salesOrderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.SOStatus;
        notes: string | null;
        customerId: string;
    }>;
    findAll(): Promise<({
        customer: {
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
            price: number;
            productId: string;
            salesOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.SOStatus;
        notes: string | null;
        customerId: string;
    })[]>;
    findOne(id: string): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string;
            code: string;
            email: string;
        };
        items: ({
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
            quantity: number;
            price: number;
            productId: string;
            salesOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.SOStatus;
        notes: string | null;
        customerId: string;
    }>;
    updateStatus(id: string, dto: UpdateSOStatusDto, req: any): Promise<{
        customer: {
            id: string;
            createdAt: Date;
            name: string;
            phone: string;
            address: string;
            code: string;
            email: string;
        };
        items: ({
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
            quantity: number;
            price: number;
            productId: string;
            salesOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.SOStatus;
        notes: string | null;
        customerId: string;
    }>;
}
