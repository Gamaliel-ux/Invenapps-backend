import { AuditLogsService } from './audit-logs.service';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
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
