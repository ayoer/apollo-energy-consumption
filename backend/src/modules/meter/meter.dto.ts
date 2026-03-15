import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMeterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
