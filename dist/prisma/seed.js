"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.stockOpname.deleteMany({});
    await prisma.stockMovement.deleteMany({});
    await prisma.salesOrderItem.deleteMany({});
    await prisma.salesOrder.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    const users = [
        {
            id: 'u1',
            username: 'admin',
            passwordHash,
            role: client_1.Role.ADMIN,
            isActive: true,
            createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        },
        {
            id: 'u2',
            username: 'staff',
            passwordHash,
            role: client_1.Role.STAFF,
            isActive: true,
            createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
        },
        {
            id: 'u3',
            username: 'manager',
            passwordHash,
            role: client_1.Role.MANAGER,
            isActive: true,
            createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
        },
    ];
    for (const u of users) {
        await prisma.user.create({ data: u });
    }
    const categories = [
        { id: 'c1', name: 'Foods & Beverages', createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000) },
        { id: 'c2', name: 'Electronics', createdAt: new Date(Date.now() - 95 * 24 * 3600 * 1000) },
        { id: 'c3', name: 'Apparels', createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000) },
        { id: 'c4', name: 'Office Stationery', createdAt: new Date(Date.now() - 85 * 24 * 3600 * 1000) },
    ];
    for (const c of categories) {
        await prisma.category.create({ data: c });
    }
    const suppliers = [
        {
            id: 's1',
            name: 'Global Foods Inc.',
            contact: 'orders@globalfoods.com',
            phone: '+628123456789',
            address: 'Kawasan Industri Pulo Gadung, Jakarta',
            createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000),
        },
        {
            id: 's2',
            name: 'Apex Electronics Corp',
            contact: 'b2b@apexelectronics.com',
            phone: '+628776543210',
            address: 'Silicon Plaza Building Floor 4, Bandung',
            createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000),
        },
        {
            id: 's3',
            name: 'IndoTextile Factory',
            contact: 'dist@indotextile.co.id',
            phone: '+628198765432',
            address: 'Jl. Raya Rancaekek KM 12, Sumedang',
            createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000),
        },
    ];
    for (const s of suppliers) {
        await prisma.supplier.create({ data: s });
    }
    const customers = [
        {
            id: 'cust1',
            code: 'CUST-0001',
            name: 'Budi Santoso',
            phone: '081211112222',
            email: 'budi.santoso@gmail.com',
            address: 'Jl. Kebon Jeruk No 14, Jakarta Barat',
            createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000),
        },
        {
            id: 'cust2',
            code: 'CUST-0002',
            name: 'Siti Rahmawati',
            phone: '081399998888',
            email: 'siti.rahma@yahoo.com',
            address: 'Jl. Dago Asri Lestari No 10, Bandung',
            createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000),
        },
        {
            id: 'cust3',
            code: 'CUST-0003',
            name: 'Lippo Supermarket',
            phone: '02155554444',
            email: 'procurement@lipposuper.com',
            address: 'Karawaci Financial District, Tangerang',
            createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000),
        },
    ];
    for (const cust of customers) {
        await prisma.customer.create({ data: cust });
    }
    const products = [
        {
            id: 'p1',
            sku: 'FNB-IND-001',
            barcode: '8991234567081',
            name: 'Indomie Goreng Original',
            description: 'Instant fried noodles pack 85g',
            categoryId: 'c1',
            supplierId: 's1',
            purchasePrice: 2400,
            sellingPrice: 3100,
            stock: 500,
            minStock: 200,
            unit: 'pcs',
            createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000),
        },
        {
            id: 'p2',
            sku: 'ELC-XIA-002',
            barcode: '6971234567112',
            name: 'Xiaomi Powerbank 10000mAh',
            description: 'Ultra slim powerbank double output fast-charge',
            categoryId: 'c2',
            supplierId: 's2',
            purchasePrice: 165000,
            sellingPrice: 219000,
            stock: 8,
            minStock: 15,
            unit: 'pcs',
            createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000),
        },
        {
            id: 'p3',
            sku: 'APP-POL-003',
            barcode: '8882345678123',
            name: 'Polo Shirt Navy Blue',
            description: 'Cotton pique polo shirt classic fit size L',
            categoryId: 'c3',
            supplierId: 's3',
            purchasePrice: 85000,
            sellingPrice: 139000,
            stock: 85,
            minStock: 20,
            unit: 'pcs',
            createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000),
        },
        {
            id: 'p4',
            sku: 'OFC-PAP-004',
            barcode: '8999876543211',
            name: 'PaperOne A4 80gsm',
            description: 'Multi-purpose office paper 500 sheets',
            categoryId: 'c4',
            supplierId: 's3',
            purchasePrice: 42000,
            sellingPrice: 55000,
            stock: 0,
            minStock: 10,
            unit: 'reams',
            createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000),
        },
        {
            id: 'p5',
            sku: 'FNB-CLS-005',
            barcode: '8990123456789',
            name: 'Coca-Cola Can 330ml',
            description: 'Carbonated soft drink canned',
            categoryId: 'c1',
            supplierId: 's1',
            purchasePrice: 4500,
            sellingPrice: 6500,
            stock: 120,
            minStock: 40,
            unit: 'can',
            createdAt: new Date(Date.now() - 35 * 24 * 3600 * 1000),
        },
    ];
    for (const prod of products) {
        await prisma.product.create({ data: prod });
    }
    const purchaseOrders = [
        {
            id: 'po1',
            code: 'PO-2026-0001',
            supplierId: 's1',
            totalValue: 1620000,
            status: client_1.POStatus.RECEIVED,
            notes: 'Rush restock for monthly promo',
            createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
            approvedBy: 'manager',
            receivedBy: 'staff',
            items: {
                create: [
                    { id: 'poi1', productId: 'p1', quantity: 300, price: 2400 },
                    { id: 'poi2', productId: 'p5', quantity: 200, price: 4500 },
                ],
            },
        },
        {
            id: 'po2',
            code: 'PO-2026-0002',
            supplierId: 's2',
            totalValue: 8250000,
            status: client_1.POStatus.PENDING_APPROVAL,
            notes: 'Reorder xiaomi stock to meet buffer limits',
            createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
            items: {
                create: [
                    { id: 'poi3', productId: 'p2', quantity: 50, price: 165000 },
                ],
            },
        },
    ];
    for (const po of purchaseOrders) {
        await prisma.purchaseOrder.create({ data: po });
    }
    const salesOrders = [
        {
            id: 'so1',
            code: 'SO-2026-0001',
            customerId: 'cust1',
            totalValue: 402000,
            status: client_1.SOStatus.COMPLETED,
            notes: 'Direct boutique delivery',
            createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
            items: {
                create: [
                    { id: 'soi1', productId: 'p1', quantity: 40, price: 3100 },
                    { id: 'soi2', productId: 'p3', quantity: 2, price: 139000 },
                ],
            },
        },
        {
            id: 'so2',
            code: 'SO-2026-0002',
            customerId: 'cust3',
            totalValue: 390000,
            status: client_1.SOStatus.PAID,
            notes: 'Deliver before weekend rush',
            createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
            items: {
                create: [
                    { id: 'soi3', productId: 'p5', quantity: 60, price: 6500 },
                ],
            },
        },
    ];
    for (const so of salesOrders) {
        await prisma.salesOrder.create({ data: so });
    }
    const movements = [
        {
            id: 'm1',
            productId: 'p1',
            type: client_1.MovementType.IN,
            quantity: 500,
            user: 'staff',
            notes: 'Initial inventory setup',
            createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        },
        {
            id: 'm2',
            productId: 'p2',
            type: client_1.MovementType.IN,
            quantity: 20,
            user: 'admin',
            notes: 'Restock first dispatch',
            createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000),
        },
        {
            id: 'm3',
            productId: 'p2',
            type: client_1.MovementType.OUT,
            quantity: 12,
            user: 'staff',
            notes: 'POS Retail Sale',
            createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        },
        {
            id: 'm4',
            productId: 'p3',
            type: client_1.MovementType.IN,
            quantity: 100,
            user: 'staff',
            notes: 'Supplier textile arrival',
            createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        },
        {
            id: 'm5',
            productId: 'p3',
            type: client_1.MovementType.OUT,
            quantity: 15,
            user: 'admin',
            notes: 'Web Store dispatch',
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        },
    ];
    for (const m of movements) {
        await prisma.stockMovement.create({ data: m });
    }
    const opnames = [
        {
            id: 'op1',
            code: 'SO-OP-0001',
            productId: 'p1',
            systemQuantity: 502,
            physicalQuantity: 500,
            difference: -2,
            notes: 'Damaged packaging discarded during count',
            status: client_1.OpnameStatus.ADJUSTED,
            user: 'staff',
            createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
        },
        {
            id: 'op2',
            code: 'SO-OP-0002',
            productId: 'p3',
            systemQuantity: 85,
            physicalQuantity: 85,
            difference: 0,
            notes: 'Perfect match',
            status: client_1.OpnameStatus.PENDING,
            user: 'staff',
            createdAt: new Date(Date.now() - 12 * 3600 * 1000),
        },
    ];
    for (const op of opnames) {
        await prisma.stockOpname.create({ data: op });
    }
    const notifications = [
        {
            id: 'n1',
            type: client_1.NotificationType.LOW_STOCK,
            message: 'Xiaomi Powerbank 10000mAh is under minimum stock level! (8 left, min 15)',
            read: false,
            createdAt: new Date(Date.now() - 4 * 3600 * 1000),
        },
        {
            id: 'n2',
            type: client_1.NotificationType.OUT_OF_STOCK,
            message: 'PaperOne A4 80gsm is out of stock! (0 left, min 10)',
            read: false,
            createdAt: new Date(Date.now() - 18 * 3600 * 1000),
        },
        {
            id: 'n3',
            type: client_1.NotificationType.PENDING_APPROVAL,
            message: 'New Purchase Order PO-2026-0002 awaits your approval.',
            read: false,
            createdAt: new Date(Date.now() - 22 * 1000),
        },
    ];
    for (const n of notifications) {
        await prisma.notification.create({ data: n });
    }
    const auditLogs = [
        {
            id: 'al1',
            userId: 'u1',
            username: 'admin',
            action: 'LOGIN',
            module: 'Auth',
            detail: 'Admin logged into the portal',
            createdAt: new Date(Date.now() - 25 * 60 * 1000),
        },
        {
            id: 'al2',
            userId: 'u2',
            username: 'staff',
            action: 'CREATE_OPNAME',
            module: 'Stock Opname',
            detail: 'Stock count entry for Indomie Goreng Original with -2 difference',
            createdAt: new Date(Date.now() - 6 * 2 * 3600 * 1000),
        },
        {
            id: 'al3',
            userId: 'u3',
            username: 'manager',
            action: 'LOGIN',
            module: 'Auth',
            detail: 'Manager authenticated safely',
            createdAt: new Date(Date.now() - 12 * 60 * 1000),
        },
    ];
    for (const al of auditLogs) {
        await prisma.auditLog.create({ data: al });
    }
    console.log('Database successfully seeded! 🌱');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map