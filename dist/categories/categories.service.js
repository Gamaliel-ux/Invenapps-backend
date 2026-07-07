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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let CategoriesService = class CategoriesService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async create(name, reqUser) {
        const existing = await this.prisma.category.findUnique({
            where: { name },
        });
        if (existing) {
            throw new common_1.ConflictException(`Category "${name}" already exists`);
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
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, name, reqUser) {
        await this.findOne(id);
        const existing = await this.prisma.category.findFirst({
            where: { name, id: { not: id } },
        });
        if (existing) {
            throw new common_1.ConflictException(`Category "${name}" already exists`);
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
    async remove(id, reqUser) {
        const category = await this.findOne(id);
        if (category.products.length > 0) {
            throw new common_1.ConflictException('Cannot delete category containing products');
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map