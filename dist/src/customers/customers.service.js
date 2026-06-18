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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let CustomersService = class CustomersService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async create(dto, reqUser) {
        const existing = await this.prisma.customer.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.ConflictException(`Customer code "${dto.code}" already exists`);
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
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: { SalesOrders: true },
        });
        if (!customer) {
            throw new common_1.NotFoundException(`Customer with ID ${id} not found`);
        }
        return customer;
    }
    async update(id, dto, reqUser) {
        await this.findOne(id);
        const existing = await this.prisma.customer.findFirst({
            where: { code: dto.code, id: { not: id } },
        });
        if (existing) {
            throw new common_1.ConflictException(`Customer code "${dto.code}" is already in use by another customer`);
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
    async remove(id, reqUser) {
        const customer = await this.findOne(id);
        if (customer.SalesOrders.length > 0) {
            throw new common_1.ConflictException('Cannot delete customer with existing sales orders');
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
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map