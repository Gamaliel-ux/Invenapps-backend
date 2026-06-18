import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class SuppliersService {
    private prisma;
    private auditLogs;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService);
    create(dto: CreateSupplierDto, reqUser: any): Promise<{
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
    update(id: string, dto: CreateSupplierDto, reqUser: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        contact: string | null;
        phone: string | null;
        address: string | null;
    }>;
    remove(id: string, reqUser: any): Promise<{
        success: boolean;
    }>;
}
