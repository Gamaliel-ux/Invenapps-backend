import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateStockOpnameDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0)
  physicalQuantity: number;

  @IsNumber()
  @IsOptional()
  systemQuantity?: number;

  @IsNumber()
  @IsOptional()
  difference?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
