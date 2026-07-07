import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ProductsService {
    private prisma;
    private auditLogs;
    private notifications;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService, notifications: NotificationsService);
    checkStockLevels(productId: string): Promise<void>;
    create(dto: CreateProductDto, reqUser: any): Promise<{
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
    }>;
    findAll(includeDeleted?: boolean): Promise<({
        category: {
            name: string;
        };
        supplier: {
            name: string;
        } | null;
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
        };
        supplier: {
            id: string;
            createdAt: Date;
            name: string;
            contact: string | null;
            phone: string | null;
            address: string | null;
        } | null;
    } & {
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
    }>;
    update(id: string, dto: UpdateProductDto, reqUser: any): Promise<{
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
    }>;
    remove(id: string, reqUser: any): Promise<{
        success: boolean;
    }>;
}
