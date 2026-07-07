"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockOpnamesModule = void 0;
const common_1 = require("@nestjs/common");
const stock_opnames_service_1 = require("./stock-opnames.service");
const stock_opnames_controller_1 = require("./stock-opnames.controller");
const products_module_1 = require("../products/products.module");
const audit_logs_module_1 = require("../audit-logs/audit-logs.module");
let StockOpnamesModule = class StockOpnamesModule {
};
exports.StockOpnamesModule = StockOpnamesModule;
exports.StockOpnamesModule = StockOpnamesModule = __decorate([
    (0, common_1.Module)({
        imports: [products_module_1.ProductsModule, audit_logs_module_1.AuditLogsModule],
        controllers: [stock_opnames_controller_1.StockOpnamesController],
        providers: [stock_opnames_service_1.StockOpnamesService],
        exports: [stock_opnames_service_1.StockOpnamesService],
    })
], StockOpnamesModule);
//# sourceMappingURL=stock-opnames.module.js.map