import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(name: string, reqUser: any) {
    const existing = await this.prisma.category.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(`Category "${name}" already exists`);
    }
    const category = await this.prisma.category.create({ data: { name } });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_CATEGORY',
      module: 'Categories',
      detail: `Created category: ${name} (ID: ${category.id})`,
    });

    return category;
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, name: string, reqUser: any) {
    await this.findOne(id);
    const existing = await this.prisma.category.findFirst({
      where: { name, id: { not: id } },
    });
    if (existing) {
      throw new ConflictException(`Category "${name}" already exists`);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: { name },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'UPDATE_CATEGORY',
      module: 'Categories',
      detail: `Updated category ID ${id} name to: ${name}`,
    });

    return updated;
  }

  async remove(id: string, reqUser: any) {
    const category = await this.findOne(id);
    if (category.products.length > 0) {
      throw new ConflictException('Cannot delete category containing products');
    }
    await this.prisma.category.delete({ where: { id } });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'DELETE_CATEGORY',
      module: 'Categories',
      detail: `Deleted category: ${category.name} (ID: ${id})`,
    });

    return { success: true };
  }
}
