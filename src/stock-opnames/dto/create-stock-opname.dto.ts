import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStockOpnameDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0)
  physicalQuantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
