    import { ApiProperty } from '@nestjs/swagger';
    import { IsString, IsOptional, IsEnum, IsNumber, ValidateNested } from 'class-validator';
    import { Type } from 'class-transformer';
    import { AssemblyType } from './create-assembly.dto'; 

    // Sub-DTO para asistencia (igual que en create)
    class AttendanceDto {
    @ApiProperty({ example: 95 })
    @IsNumber()
    present!: number;

    @ApiProperty({ example: 107 })
    @IsNumber()
    total!: number;
    }

    export class UpdateAssemblyDto {
    @ApiProperty({ 
        description: 'Título de la asamblea',
        required: false,
        example: 'Asamblea General - Enero 2025' 
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ 
        description: 'Tipo de asamblea: general o de piso',
        enum: AssemblyType, 
        required: false,
        example: AssemblyType.GENERAL 
    })
    @IsOptional()
    @IsEnum(AssemblyType)
    type?: AssemblyType;

    @ApiProperty({ 
        description: 'Fecha de la asamblea (formato YYYY-MM-DD)',
        required: false,
        example: '2025-01-15' 
    })
    @IsOptional()
    @IsString()
    date?: string;

    @ApiProperty({ 
        description: 'Hora de la asamblea (formato HH:MM)',
        required: false,
        example: '19:00' 
    })
    @IsOptional()
    @IsString()
    time?: string;

    @ApiProperty({ 
        description: 'Ubicación donde se realizará la asamblea',
        required: false,
        example: 'Salón de actos, Planta baja' 
    })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ 
        description: 'Descripción adicional de la asamblea',
        required: false,
        example: 'Discusión sobre mejoras en la residencia y presupuesto 2025',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        description: 'Número de piso (solo para asambleas de piso)',
        required: false, 
        example: 2 
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    floor?: number;

    @ApiProperty({ 
        description: 'Control de asistencia',
        required: false, 
        type: () => AttendanceDto,
        example: { present: 95, total: 107 } 
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => AttendanceDto)
    attendance?: AttendanceDto;
    }
