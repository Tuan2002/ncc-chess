import { Expose } from "class-transformer";
import { IsDate, IsNumber, IsString } from "class-validator";

export class PlayerData {
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
  email?: string;
  @Expose()
  @IsString()
  displayName?: string;
  @Expose()
  @IsString()
  avatarUrl?: string;
  @Expose()
  @IsNumber()
  elo: number;
  @Expose()
  @IsString()
  note?: string;
  @Expose()
  @IsDate()
  createdAt: Date;
}