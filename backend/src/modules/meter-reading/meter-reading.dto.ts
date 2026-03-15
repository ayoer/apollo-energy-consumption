import { IsNotEmpty, IsUUID, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateMeterReadingDto {
  @IsUUID()
  @IsNotEmpty()
  meterId: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @IsNumber()
  @Min(0)
  index_kwh: number;
}
