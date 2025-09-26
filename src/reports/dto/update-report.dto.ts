    import { ApiProperty } from '@nestjs/swagger';
    import { IsString, IsOptional, IsDateString } from 'class-validator';

    export class UpdateReportDto {
    @ApiProperty({
        description: 'ID del residente (ObjectId) o código estudiantil',
        required: false,
        example: '68ae1a59bbbd043d7a334ba1',
    })
    @IsOptional()
    @IsString()
    resident?: string;

    @ApiProperty({
        description: 'Código estudiantil del residente al que pertenece el reporte',
        required: false,
        example: '202312345',
    })
    @IsOptional()
    @IsString()
    studentCode?: string;

    @ApiProperty({
        description: 'Fecha del reporte',
        required: false,
        example: '2025-09-13T12:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiProperty({
        description: 'Motivo del reporte',
        required: false,
        example: 'Filtración en el baño de la habitación',
    })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        description: 'Acción correctiva o medida tomada',
        required: false,
        example: 'Reparación programada para el lunes',
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
    urgent?: boolean;

    @ApiProperty({
        description: 'Ubicación específica del daño',
        required: false,
        example: '224',
    })
    @IsOptional()
    @IsString()
    room?: string;

    @ApiProperty({
        description: 'Descripción detallada del daño',
        required: false,
        example: 'El grifo del lavamanos gotea constantemente',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Tipo de ubicación: habitación específica o área común',
        required: false,
        example: 'room',
    })
    @IsOptional()
    @IsString()
    location?: string;
    }