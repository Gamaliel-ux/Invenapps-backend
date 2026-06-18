import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateCustomerDto, reqUser: any) {
    const existing = await this.prisma.customer.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Customer code "${dto.code}" already exists`);
    }

    const customer = await this.prisma.customer.create({ data: dto });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_CUSTOMER',
      module: 'Customers',
      detail: `Created customer: ${dto.name} (Code: ${dto.code})`,
    });

    return customer;
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: {
        _count: {
          select: { SalesOrders: true }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { SalesOrders: true },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, dto: CreateCustomerDto, reqUser: any) {
    await this.findOne(id);

    const existing = await this.prisma.customer.findFirst({
      where: { code: dto.code, id: { not: id } },
    });
    if (existing) {
      throw new ConflictException(`Customer code "${dto.code}" is already in use by another customer`);
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'UPDATE_CUSTOMER',
      module: 'Customers',
      detail: `Updated customer ID ${id}: ${dto.name}`,
    });

    return updated;
  }

  async remove(id: string, reqUser: any) {
    const customer = await this.findOne(id);
    if (customer.SalesOrders.length > 0) {
      throw new ConflictException('Cannot delete customer with existing sales orders');
    }
    await this.prisma.customer.delete({ where: { id } });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'DELETE_CUSTOMER',
      module: 'Customers',
      detail: `Deleted customer: ${customer.name} (ID: ${id})`,
    });

    return { success: true };
  }
}
