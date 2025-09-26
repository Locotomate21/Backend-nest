    import { ApiProperty } from '@nestjs/swagger';
    import { IsEnum, IsOptional, IsString } from 'class-validator';

    export class UpdateAssemblyStatusDto {
    @ApiProperty({ enum: ['Completada', 'Aplazada', 'Cancelada'] })
    @IsEnum(['Completada', 'Aplazada', 'Cancelada'])
    status?: 'Completada' | 'Aplazada' | 'Cancelada';

    @ApiProperty({ required: false, description: 'Motivo de aplazamiento/cancelación' })
    @IsOptional()
    @IsString()
    postponementReason?: string;

    @ApiProperty({ required: false, description: 'Nueva fecha en caso de aplazamiento', example: '2025-02-20' })
    @IsOptional()
    @IsString()
    newDate?: string;

    @ApiProperty({ required: false, description: 'Nueva hora en caso de aplazamiento', example: '19:30' })
    @IsOptional()
    @IsString()
    newTime?: string;
    }
