import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}
