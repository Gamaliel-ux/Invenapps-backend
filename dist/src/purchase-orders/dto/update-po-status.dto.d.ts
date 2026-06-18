import { POStatus } from '@prisma/client';
export declare class UpdatePOStatusDto {
    status: POStatus;
    notes?: string;
}
