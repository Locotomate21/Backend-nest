    import { PartialType } from '@nestjs/mapped-types';
    import { CreateDisciplinaryMeasureDto, DisciplinaryStatus } from './create-disciplinary-measure.dto';
    import { ApiPropertyOptional } from '@nestjs/swagger';
    import { IsOptional, IsEnum, IsString } from 'class-validator';

    export class UpdateDisciplinaryMeasureDto extends PartialType(CreateDisciplinaryMeasureDto) {
    @ApiPropertyOptional({
        example: 'Uso indebido de áreas comunes - Habitación 205',
        description: 'Nuevo título de la medida disciplinaria',
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        example: 'Caso resuelto mediante diálogo y compromiso del residente.',
        description: 'Nueva descripción de la medida',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        example: DisciplinaryStatus.Resuelta,
        description: 'Nuevo estado de la medida',
        enum: DisciplinaryStatus,
    })
    @IsOptional()
    @IsEnum(DisciplinaryStatus)
    status?: DisciplinaryStatus;
    }
