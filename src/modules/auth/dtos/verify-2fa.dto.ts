import { IsDefined, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class Verify2faDto {
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  readonly code: string

  @IsNotEmpty()
  @IsString()
  @IsDefined()
  @IsEmail()
  readonly email: string
}
