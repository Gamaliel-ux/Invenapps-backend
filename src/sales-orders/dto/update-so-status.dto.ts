import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SOStatus } from '@prisma/client';

export class UpdateSOStatusDto {
  @IsEnum(SOStatus)
  status: SOStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
