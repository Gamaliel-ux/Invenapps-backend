"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const token_service_1 = require("./services/token.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    prisma;
    auditLogs;
    tokenService;
    constructor(usersService, jwtService, prisma, auditLogs, tokenService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.auditLogs = auditLogs;
        this.tokenService = tokenService;
    }
    async login(loginDto, ip) {
        const user = await this.usersService.findOneByUsername(loginDto.username);
        if (!user) {
            await this.auditLogs.create({
                username: loginDto.username,
                action: 'LOGIN_FAILED',
                module: 'Authentication',
                detail: 'Invalid username',
            });
            throw new common_1.UnauthorizedException('Invalid credentials or inactive account');
        }
        if (!user.isActive) {
            await this.auditLogs.create({
                userId: user.id,
                username: user.username,
                action: 'LOGIN_INACTIVE_ACCOUNT',
                module: 'Authentication',
                detail: 'Inactive account',
            });
            throw new common_1.UnauthorizedException('Invalid credentials or inactive account');
        }
        const now = new Date();
        if (user.lockUntil && user.lockUntil > now) {
            await this.auditLogs.create({
                userId: user.id,
                username: user.username,
                action: 'LOGIN_BLOCKED',
                module: 'Authentication',
                detail: `Account locked until ${user.lockUntil.toISOString()}`,
            });
            throw new common_1.UnauthorizedException('Account locked, try again later');
        }
        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            const nextAttempts = (user.loginAttempts ?? 0) + 1;
            const lockUntil = nextAttempts >= 3 ? new Date(Date.now() + 5 * 60 * 1000) : null;
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: nextAttempts,
                    lockUntil,
                },
            });
            await this.auditLogs.create({
                userId: user.id,
                username: user.username,
                action: 'LOGIN_FAILED',
                module: 'Authentication',
                detail: lockUntil
                    ? 'Reached max failed login attempts; account temporarily locked'
                    : `Wrong password attempt ${nextAttempts}`,
            });
            throw new common_1.UnauthorizedException('Invalid credentials or inactive account');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: 0,
                lockUntil: null,
                lastLoginAt: new Date(),
            },
        });
        await this.auditLogs.create({
            userId: user.id,
            username: user.username,
            action: 'LOGIN_SUCCESS',
            module: 'Authentication',
            detail: ip ? `Successful login from ${ip}` : 'Successful login',
        });
        const payload = { username: user.username, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.tokenService.generateRefreshToken(user.id, user.username);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 3600,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        };
    }
    async register(registerDto) {
        return this.usersService.create(registerDto);
    }
    async refreshToken(refreshToken) {
        if (this.tokenService.isTokenBlacklisted(refreshToken)) {
            throw new common_1.UnauthorizedException('Token has been revoked');
        }
        const payload = this.tokenService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.usersService.findOne(payload.sub);
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        const newPayload = { username: user.username, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(newPayload);
        return {
            access_token: accessToken,
            expires_in: 3600,
        };
    }
    async logout(token) {
        this.tokenService.blacklistToken(token);
        return { message: 'Logout successful' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService,
        token_service_1.TokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map