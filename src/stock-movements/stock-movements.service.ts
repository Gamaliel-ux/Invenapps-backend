import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stockMovement.findMany({
      include: {
        product: { select: { name: true, sku: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProduct(productId: string) {
    return this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
