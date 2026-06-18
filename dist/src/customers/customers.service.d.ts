import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class CustomersService {
    private prisma;
    private auditLogs;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService);
    create(dto: CreateCustomerDto, reqUser: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    }>;
    findAll(): Promise<({
        _count: {
            SalesOrders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    })[]>;
    findOne(id: string): Promise<{
        SalesOrders: {
            id: string;
            createdAt: Date;
            code: string;
            totalValue: number;
            status: import("@prisma/client").$Enums.SOStatus;
            notes: string | null;
            customerId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    }>;
    update(id: string, dto: CreateCustomerDto, reqUser: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    }>;
    remove(id: string, reqUser: any): Promise<{
        success: boolean;
    }>;
}
