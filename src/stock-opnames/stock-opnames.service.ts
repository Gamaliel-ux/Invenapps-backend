import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockOpnameDto } from './dto/create-stock-opname.dto';
import { ProductsService } from '../products/products.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { OpnameStatus, MovementType, Prisma } from '@prisma/client';

@Injectable()
export class StockOpnamesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private auditLogs: AuditLogsService,
  ) {}

  async create(dto: CreateStockOpnameDto, reqUser: any) {
    const existing = await this.prisma.stockOpname.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Stock Opname code "${dto.code}" already exists`);
    }

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isDeleted: false },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    const systemQuantity = product.stock;
    const difference = dto.physicalQuantity - systemQuantity;

    const opname = await this.prisma.stockOpname.create({
      data: {
        code: dto.code,
        productId: dto.productId,
        systemQuantity,
        physicalQuantity: dto.physicalQuantity,
        difference,
        notes: dto.notes || '',
        status: OpnameStatus.PENDING,
        user: reqUser.username,
      },
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'CREATE_OPNAME',
      module: 'Stock Opname',
      detail: `Created stock opname ${opname.code} for product "${product.name}". Diff: ${difference}`,
    });

    return opname;
  }

  async findAll() {
    return this.prisma.stockOpname.findMany({
      include: {
        product: { select: { name: true, sku: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const opname = await this.prisma.stockOpname.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!opname) {
      throw new NotFoundException(`Stock Opname with ID ${id} not found`);
    }
    return opname;
  }

  async adjust(id: string, reqUser: any) {
    const opname = await this.findOne(id);
    if (opname.status === OpnameStatus.ADJUSTED) {
      throw new BadRequestException('This stock opname has already been ADJUSTED');
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update opname status
      await tx.stockOpname.update({
        where: { id },
        data: { status: OpnameStatus.ADJUSTED },
      });

      // Adjust product stock
      await tx.product.update({
        where: { id: opname.productId },
        data: { stock: opname.physicalQuantity },
      });

      // Create stock movement adjustment
      await tx.stockMovement.create({
        data: {
          productId: opname.productId,
          type: MovementType.ADJUSTMENT,
          quantity: opname.difference, // Positive or negative discrepancy
          user: reqUser.username,
          notes: `Stock opname adjustment: ${opname.code}`,
        },
      });
    });

    await this.auditLogs.create({
      userId: reqUser.id,
      username: reqUser.username,
      action: 'ADJUST_OPNAME',
      module: 'Stock Opname',
      detail: `Reconciled stock opname ${opname.code}. New stock: ${opname.physicalQuantity}`,
    });

    // Run stock level checks
    await this.productsService.checkStockLevels(opname.productId);

    return this.findOne(id);
  }
}
