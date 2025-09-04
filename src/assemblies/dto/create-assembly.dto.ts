    import { ApiProperty } from '@nestjs/swagger';
    import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

    export class CreateAssemblyDto {
    @ApiProperty({ example: 'Asamblea General - Enero 2025' })
    @IsString()
    title?: string;

    @ApiProperty({ enum: ['general', 'floor'], example: 'general' })
    @IsEnum(['general', 'floor'])
    type?: 'general' | 'floor';

    @ApiProperty({ example: '2025-01-15' })
    @IsString()
    date?: string;

    @ApiProperty({ example: '19:00' })
    @IsString()
    time?: string;

    @ApiProperty({ example: 'Salón de actos, Planta baja' })
    @IsString()
    location?: string;

    @ApiProperty({ required: false, example: 2 })
    @IsOptional()
    @IsNumber()
    floor?: number;

    @ApiProperty({ required: false, example: { present: 95, total: 107 } })
    @IsOptional()
    attendance?: { present: number; total: number };

    @ApiProperty({ required: false, enum: ['Programada', 'Completada'], example: 'Programada' })
    @IsOptional()
    @IsString()
    status?: 'Programada' | 'Completada';
    }
