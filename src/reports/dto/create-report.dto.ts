import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: '6891061f8e15482831e9e393', description: 'ID del residente' })
  @IsMongoId()
  resident!: string;

  @ApiProperty({ example: 'Daño en la ducha del baño 301', description: 'Motivo del reporte' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty({ example: 'Se llamó al mantenimiento', required: false })
  @IsString()
  @IsOptional()
  actionTaken?: string;
}
