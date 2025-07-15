import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class RegisterData {
  @Expose()
  @IsString()
  registerKey: string;
  @Expose()
  @IsString()
  mezonId: string;
}