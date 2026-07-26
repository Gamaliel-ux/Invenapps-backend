import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  // Simple in-memory blacklist - in production use Redis
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate refresh token (valid for 7 days)
   */
  generateRefreshToken(userId: string, username: string) {
    return this.jwtService.sign(
      { sub: userId, username, type: 'refresh' },
      {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'super_secret_jwt_key_invenapps_2026',
        expiresIn: '7d',
      },
    );
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'super_secret_jwt_key_invenapps_2026',
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Add token to blacklist (logout functionality)
   */
  blacklistToken(token: string) {
    this.tokenBlacklist.add(token);
  }

  /**
   * Check if token is blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  /**
   * Clear old blacklisted tokens (periodic cleanup)
   */
  clearExpiredBlacklist() {
    // In production, implement with Redis TTL
    // For now, this is a simple in-memory implementation
    this.tokenBlacklist.clear();
  }
}
