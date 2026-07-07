import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
