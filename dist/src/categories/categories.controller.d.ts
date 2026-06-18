import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(name: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }>;
    findAll(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
    })[]>;
    findOne(id: string): Promise<{
        products: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
    }>;
    update(id: string, name: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
