import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { TokenService } from './services/token.service';
import { Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

jest.mock('bcrypt');
jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(),
    keyuri: jest.fn(),
    verify: jest.fn(),
  },
}));
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('mock-qr-code-data-url'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let auditLogs: AuditLogsService;
  let tokenService: TokenService;

  const mockUser = {
    id: 'user-id',
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: 'hashed-password',
    role: Role.ADMIN,
    isActive: true,
    loginAttempts: 0,
    lockUntil: null,
    isMfaEnabled: false,
    mfaSecret: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByUsername: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn().mockResolvedValue({}),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: AuditLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateRefreshToken: jest
              .fn()
              .mockReturnValue('mock-refresh-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    auditLogs = module.get<AuditLogsService>(AuditLogsService);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should complete login immediately for non-admin users', async () => {
      const staffUser = { ...mockUser, role: Role.STAFF };
      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(
        staffUser,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        username: 'staff',
        password: 'password',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect((result as any).user.role).toBe(Role.STAFF);
    });

    it('should return mfaRequired and setup details for Admin without MFA enabled', async () => {
      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (authenticator.generateSecret as jest.Mock).mockReturnValue('generated-secret');
      (authenticator.keyuri as jest.Mock).mockReturnValue('otpauth-uri');

      const result = await authService.login({
        username: 'admin',
        password: 'password',
      });

      expect(result).toEqual({
        mfaRequired: true,
        mfaSetup: true,
        mfaToken: 'mock-jwt-token',
        qrCodeUrl: 'otpauth-uri',
        qrCodeDataUrl: 'mock-qr-code-data-url',
      });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ mfaSecret: 'generated-secret' }),
        }),
      );
    });

    it('should return mfaRequired for Admin with MFA enabled', async () => {
      const mfaEnabledAdmin = {
        ...mockUser,
        isMfaEnabled: true,
        mfaSecret: 'existing-secret',
      };
      (usersService.findOneByUsername as jest.Mock).mockResolvedValue(
        mfaEnabledAdmin,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        username: 'admin',
        password: 'password',
      });

      expect(result).toEqual({
        mfaRequired: true,
        mfaSetup: false,
        mfaToken: 'mock-jwt-token',
      });
    });
  });

  describe('verifyMfa', () => {
    it('should verify code and return tokens, marking MFA enabled if it was false', async () => {
      const mfaToken = 'temp-mfa-token';
      const mfaPayload = {
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        isMfaTemp: true,
      };
      (jwtService.verify as jest.Mock).mockReturnValue(mfaPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        mfaSecret: 'mfa-secret',
      });
      (authenticator.verify as jest.Mock).mockReturnValue(true);

      const result = await authService.verifyMfa({ mfaToken, code: '123456' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ isMfaEnabled: true }),
        }),
      );
    });

    it('should throw UnauthorizedException if code is invalid', async () => {
      const mfaToken = 'temp-mfa-token';
      const mfaPayload = {
        sub: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        isMfaTemp: true,
      };
      (jwtService.verify as jest.Mock).mockReturnValue(mfaPayload);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        mfaSecret: 'mfa-secret',
      });
      (authenticator.verify as jest.Mock).mockReturnValue(false);

      await expect(
        authService.verifyMfa({ mfaToken, code: '000000' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
