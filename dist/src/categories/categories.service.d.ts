import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class CategoriesService {
    private prisma;
    private auditLogs;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService);
    create(name: string, reqUser: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }>;
    findAll(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
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
    }>;
    update(id: string, name: string, reqUser: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }>;
    remove(id: string, reqUser: any): Promise<{
        success: boolean;
    }>;
}
