import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        sku: string;
        barcode: string;
        description: string;
        purchasePrice: number;
        sellingPrice: number;
        stock: number;
        minStock: number;
        unit: string;
        isDeleted: boolean;
        categoryId: string;
        supplierId: string | null;
    }>;
    findAll(includeDeleted?: string): Promise<({
        category: {
            name: string;
        };
        supplier: {
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        sku: string;
        barcode: string;
        description: string;
        purchasePrice: number;
        sellingPrice: number;
        stock: number;
        minStock: number;
        unit: string;
        isDeleted: boolean;
        categoryId: string;
        supplierId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
        };
        supplier: {
            id: string;
            createdAt: Date;
            name: string;
            contact: string | null;
            phone: string | null;
            address: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        sku: string;
        barcode: string;
        description: string;
        purchasePrice: number;
        sellingPrice: number;
        stock: number;
        minStock: number;
        unit: string;
        isDeleted: boolean;
        categoryId: string;
        supplierId: string | null;
    }>;
    update(id: string, dto: UpdateProductDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        sku: string;
        barcode: string;
        description: string;
        purchasePrice: number;
        sellingPrice: number;
        stock: number;
        minStock: number;
        unit: string;
        isDeleted: boolean;
        categoryId: string;
        supplierId: string | null;
    }>;
    patch(id: string, dto: UpdateProductDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        sku: string;
        barcode: string;
        description: string;
        purchasePrice: number;
        sellingPrice: number;
        stock: number;
        minStock: number;
        unit: string;
        isDeleted: boolean;
        categoryId: string;
        supplierId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
