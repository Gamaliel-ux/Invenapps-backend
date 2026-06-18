export declare class CreateProductDto {
    sku: string;
    barcode: string;
    name: string;
    description?: string;
    categoryId: string;
    supplierId?: string;
    purchasePrice: number;
    sellingPrice: number;
    stock: number;
    minStock: number;
    unit: string;
}
