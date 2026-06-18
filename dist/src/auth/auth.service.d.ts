import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { TokenService } from './services/token.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    private auditLogs;
    private tokenService;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService, auditLogs: AuditLogsService, tokenService: TokenService);
    login(loginDto: LoginDto, ip?: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            id: string;
            username: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        username: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        expires_in: number;
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
}
