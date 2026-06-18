import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePOStatusDto } from './dto/update-po-status.dto';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class PurchaseOrdersService {
    private prisma;
    private productsService;
    private notifications;
    private auditLogs;
    constructor(prisma: PrismaService, productsService: ProductsService, notifications: NotificationsService, auditLogs: AuditLogsService);
    create(dto: CreatePurchaseOrderDto, reqUser: any): Promise<{
        items: {
            id: string;
            quantity: number;
            price: number;
            productId: string;
            purchaseOrderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        supplierId: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.POStatus;
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
            price: number;
            productId: string;
            purchaseOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        supplierId: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.POStatus;
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
            purchaseOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        supplierId: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.POStatus;
        notes: string | null;
        approvedBy: string | null;
        receivedBy: string | null;
    }>;
    updateStatus(id: string, dto: UpdatePOStatusDto, reqUser: any): Promise<{
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
            purchaseOrderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        code: string;
        supplierId: string;
        totalValue: number;
        status: import("@prisma/client").$Enums.POStatus;
        notes: string | null;
        approvedBy: string | null;
        receivedBy: string | null;
    }>;
}
