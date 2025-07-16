import { Expose } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class DonationData {
  @Expose()
  @IsString()
  id: string;
  @Expose()
  @IsString()
  mezonId: string;
  @Expose()
  @IsString()
  userName: string;
  @Expose()
  @IsString()
  displayName?: string;
  @Expose()
  @IsString()
  avatarUrl?: string;
  @Expose()
  @IsNumber()
  amount?: number;
  @Expose()
  @IsDate()
  createdAt: Date;
  @Expose()
  @IsDate()
  updatedAt: Date;
}