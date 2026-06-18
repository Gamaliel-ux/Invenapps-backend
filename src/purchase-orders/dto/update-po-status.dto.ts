import { IsEnum, IsOptional, IsString } from 'class-validator';
import { POStatus } from '@prisma/client';

export class UpdatePOStatusDto {
  @IsEnum(POStatus)
  status: POStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
