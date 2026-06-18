import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class TokenService {
    private jwtService;
    private configService;
    private tokenBlacklist;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateRefreshToken(userId: string, username: string): string;
    verifyRefreshToken(token: string): any;
    blacklistToken(token: string): void;
    isTokenBlacklisted(token: string): boolean;
    clearExpiredBlacklist(): void;
}
