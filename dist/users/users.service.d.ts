import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(registerDto: RegisterDto): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    findOneByUsername(username: string): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        passwordHash: string;
        isActive: boolean;
        loginAttempts: number;
        lockUntil: Date | null;
        lastLoginAt: Date | null;
        isFirstLogin: boolean;
        createdAt: Date;
    } | null>;
    findOne(id: string): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        username: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    }[]>;
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
