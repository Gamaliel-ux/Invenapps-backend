import { UsersService } from './users.service';
import { Role } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateStatus(id: string, isActive: boolean): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateRole(id: string, role: Role): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    unlockUser(id: string): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        loginAttempts: number;
        lockUntil: Date | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        username: string;
        id: string;
    }>;
}
