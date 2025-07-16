import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePlayerDto {
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
}