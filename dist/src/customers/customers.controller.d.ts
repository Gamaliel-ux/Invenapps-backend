import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(dto: CreateCustomerDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    }>;
    findAll(): Promise<({
        _count: {
            SalesOrders: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    })[]>;
    findOne(id: string): Promise<{
        SalesOrders: {
            id: string;
            createdAt: Date;
            code: string;
            totalValue: number;
            status: import("@prisma/client").$Enums.SOStatus;
            notes: string | null;
            customerId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    }>;
    update(id: string, dto: CreateCustomerDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        phone: string;
        address: string;
        code: string;
        email: string;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
