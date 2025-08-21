import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ description: 'ID del residente' })
  @IsMongoId()
  resident?: string;

  @ApiProperty({ description: 'Fecha del reporte', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Motivo del reporte' })
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Acción tomada', required: false })
  @IsOptional()
  @IsString()
  actionTaken?: string;
}
