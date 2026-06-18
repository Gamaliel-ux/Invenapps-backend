import { PrismaService } from '../prisma/prisma.service';
export declare class AuditLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(log: {
        userId?: string;
        username: string;
        action: string;
        module: string;
        detail?: string;
    }): Promise<{
        id: string;
        username: string;
        createdAt: Date;
        action: string;
        module: string;
        detail: string | null;
        userId: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        username: string;
        createdAt: Date;
        action: string;
        module: string;
        detail: string | null;
        userId: string | null;
    }[]>;
}
