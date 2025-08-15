import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {
    @ApiPropertyOptional({ example: 'Se reemplazó la grifería' })
    @IsString()
    @IsOptional()
    actionTaken?: string;
}
