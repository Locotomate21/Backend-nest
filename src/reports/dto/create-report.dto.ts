import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsBoolean, ValidateIf, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @ApiProperty({
    description: 'ID del residente (ObjectId) o código estudiantil',
    example: '20165',
  })
  @ValidateIf(o => !o.studentCode)
  @IsString()
  resident?: string;

  @ApiProperty({
    description: 'Código estudiantil del residente al que pertenece el reporte',
    required: false,
    example: '20165',
  })
  @ValidateIf(o => !o.resident)
  @Type(() => Number)
  @IsNumber()
  studentCode?: number;

  @ApiProperty({
    description: 'Fecha del reporte',
    required: false,
    example: '2025-09-13T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Motivo/título del reporte',
    example: 'Filtración en el baño',
  })
  @IsString()
  reason!: string;

  @ApiProperty({
    description: 'Acción correctiva o medida tomada',
    required: false,
    example: 'Reparación programada',
  })
  @IsOptional()
  @IsString()
  actionTaken?: string;

  @ApiProperty({
    description: 'Indica si el reporte es urgente',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  urgent?: boolean;

  @ApiProperty({
    description: 'Descripción detallada del daño',
    required: false,
    example: 'El grifo del lavamanos gotea constantemente y se está formando charco en el piso',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo de ubicación: "room" (habitación asignada al residente) o "common_area" (área común)',
    required: false,
    example: 'room',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
