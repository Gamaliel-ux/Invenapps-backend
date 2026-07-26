import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  mfaToken: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'MFA code must be exactly 6 digits' })
  code: string;
}
