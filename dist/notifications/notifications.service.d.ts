import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(type: NotificationType, message: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
    }>;
    findAll(): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
    }>;
    markAllAsRead(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
