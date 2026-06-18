import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { TokenService } from './services/token.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    private tokenService: TokenService,
  ) {}

  async login(loginDto: LoginDto, ip?: string) {
    const user = await this.usersService.findOneByUsername(loginDto.username);

    if (!user) {
      await this.auditLogs.create({
        username: loginDto.username,
        action: 'LOGIN_FAILED',
        module: 'Authentication',
        detail: 'Invalid username',
      });
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    if (!user.isActive) {
      await this.auditLogs.create({
        userId: user.id,
        username: user.username,
        action: 'LOGIN_INACTIVE_ACCOUNT',
        module: 'Authentication',
        detail: 'Inactive account',
      });
      throw new UnauthorizedException('Invalid credentials or inactive account');
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
      throw new UnauthorizedException('Account locked, try again later');
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

      throw new UnauthorizedException('Invalid credentials or inactive account');
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

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async refreshToken(refreshToken: string) {
    if (this.tokenService.isTokenBlacklisted(refreshToken)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const newPayload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(newPayload);

    return {
      access_token: accessToken,
      expires_in: 3600,
    };
  }

  async logout(token: string) {
    this.tokenService.blacklistToken(token);
    return { message: 'Logout successful' };
  }
}
