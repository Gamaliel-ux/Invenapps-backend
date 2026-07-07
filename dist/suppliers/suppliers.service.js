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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let SuppliersService = class SuppliersService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async create(dto, reqUser) {
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
    async findOne(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier with ID ${id} not found`);
        }
        return supplier;
    }
    async update(id, dto, reqUser) {
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
    async remove(id, reqUser) {
        const supplier = await this.findOne(id);
        if (supplier.products.length > 0) {
            throw new common_1.ConflictException('Cannot delete supplier associated with products');
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
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map