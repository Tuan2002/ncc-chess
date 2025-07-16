import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDonationDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  mezonId: string;
  @Expose()
  @IsString()
  @IsNotEmpty()
  userName: string;
  @Expose()
  @IsOptional()
  @IsString()
  displayName?: string;
  @Expose()
  @IsOptional()
  @IsString()
  avatarUrl?: string; 
  @Expose()
  @IsOptional()
  @IsNumber()
  amount?: number;
}