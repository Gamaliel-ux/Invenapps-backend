import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class SuppliersService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateSupplierDto, reqUser: any) {
    const supplier = await this.prisma.supplier.create({ data: dto });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_SUPPLIER',
      module: 'Suppliers',
      detail: `Created supplier: ${dto.name} (ID: ${supplier.id})`,
    });

    return supplier;
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      include: {
        _count: {
          select: { products: true, PurchaseOrders: true }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, dto: CreateSupplierDto, reqUser: any) {
    await this.findOne(id);
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'UPDATE_SUPPLIER',
      module: 'Suppliers',
      detail: `Updated supplier ID ${id}: ${dto.name}`,
    });

    return updated;
  }

  async remove(id: string, reqUser: any) {
    const supplier = await this.findOne(id);
    if (supplier.products.length > 0) {
      throw new ConflictException('Cannot delete supplier associated with products');
    }
    await this.prisma.supplier.delete({ where: { id } });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'DELETE_SUPPLIER',
      module: 'Suppliers',
      detail: `Deleted supplier: ${supplier.name} (ID: ${id})`,
    });

    return { success: true };
  }
}
