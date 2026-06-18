"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockOpnamesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const products_service_1 = require("../products/products.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let StockOpnamesService = class StockOpnamesService {
    prisma;
    productsService;
    auditLogs;
    constructor(prisma, productsService, auditLogs) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.auditLogs = auditLogs;
    }
    async create(dto, reqUser) {
        const existing = await this.prisma.stockOpname.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.ConflictException(`Stock Opname code "${dto.code}" already exists`);
        }
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, isDeleted: false },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${dto.productId} not found`);
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
                status: client_1.OpnameStatus.PENDING,
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
    async findOne(id) {
        const opname = await this.prisma.stockOpname.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!opname) {
            throw new common_1.NotFoundException(`Stock Opname with ID ${id} not found`);
        }
        return opname;
    }
    async adjust(id, reqUser) {
        const opname = await this.findOne(id);
        if (opname.status === client_1.OpnameStatus.ADJUSTED) {
            throw new common_1.BadRequestException('This stock opname has already been ADJUSTED');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.stockOpname.update({
                where: { id },
                data: { status: client_1.OpnameStatus.ADJUSTED },
            });
            await tx.product.update({
                where: { id: opname.productId },
                data: { stock: opname.physicalQuantity },
            });
            await tx.stockMovement.create({
                data: {
                    productId: opname.productId,
                    type: client_1.MovementType.ADJUSTMENT,
                    quantity: opname.difference,
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
        await this.productsService.checkStockLevels(opname.productId);
        return this.findOne(id);
    }
};
exports.StockOpnamesService = StockOpnamesService;
exports.StockOpnamesService = StockOpnamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        audit_logs_service_1.AuditLogsService])
], StockOpnamesService);
//# sourceMappingURL=stock-opnames.service.js.map