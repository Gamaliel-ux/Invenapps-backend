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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockOpnamesController = void 0;
const common_1 = require("@nestjs/common");
const stock_opnames_service_1 = require("./stock-opnames.service");
const create_stock_opname_dto_1 = require("./dto/create-stock-opname.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let StockOpnamesController = class StockOpnamesController {
    stockOpnamesService;
    constructor(stockOpnamesService) {
        this.stockOpnamesService = stockOpnamesService;
    }
    async create(dto, req) {
        return this.stockOpnamesService.create(dto, req.user);
    }
    async findAll() {
        return this.stockOpnamesService.findAll();
    }
    async findOne(id) {
        return this.stockOpnamesService.findOne(id);
    }
    async adjust(id, req) {
        return this.stockOpnamesService.adjust(id, req.user);
    }
};
exports.StockOpnamesController = StockOpnamesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_opname_dto_1.CreateStockOpnameDto, Object]),
    __metadata("design:returntype", Promise)
], StockOpnamesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockOpnamesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockOpnamesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/adjust'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StockOpnamesController.prototype, "adjust", null);
exports.StockOpnamesController = StockOpnamesController = __decorate([
    (0, swagger_1.ApiTags)('stock-opnames'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('stock-opnames'),
    __metadata("design:paramtypes", [stock_opnames_service_1.StockOpnamesService])
], StockOpnamesController);
//# sourceMappingURL=stock-opnames.controller.js.map