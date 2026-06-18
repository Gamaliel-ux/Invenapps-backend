import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async create(log: { userId?: string; username: string; action: string; module: string; detail?: string }) {
    return this.prisma.auditLog.create({
      data: {
        userId: log.userId,
        username: log.username,
        action: log.action,
        module: log.module,
        detail: log.detail,
      },
    });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
