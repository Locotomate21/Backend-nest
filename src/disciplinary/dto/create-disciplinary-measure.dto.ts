import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export enum DisciplinaryStatus {
  Activa = 'Activa',
  Resuelta = 'Resuelta',
}

export class CreateDisciplinaryMeasureDto {
  @ApiProperty({
    example: 'Ruido excesivo - Habitación 312',
    description: 'Título corto de la medida disciplinaria',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Reporte de ruido después de las 11:00 PM. Primera advertencia emitida.',
    description: 'Descripción detallada de la medida',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: DisciplinaryStatus.Activa,
    description: 'Estado actual de la medida',
    enum: DisciplinaryStatus,
    default: DisciplinaryStatus.Activa,
  })
  @IsEnum(DisciplinaryStatus)
  status!: DisciplinaryStatus;

  @ApiProperty({
    example: 20165,
    description: 'Código del residente al que se le aplica la medida',
  })
  @IsNumber()
  @IsNotEmpty()
  studentCode!: number;
}
