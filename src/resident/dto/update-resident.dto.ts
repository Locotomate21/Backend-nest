import { PartialType } from '@nestjs/mapped-types';
import { CreateResidentDto } from './create-resident.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class UpdateResidentDto extends PartialType(CreateResidentDto) {
    @ApiProperty({ example: 'Juan Pérez', description: 'Full name of the resident' })
    @IsString()
    fullName?: string;

    @ApiProperty({ example: 123456, description: 'ID number of the resident' })
    @IsNumber()
    idNumber?: number;

    @ApiProperty({ example: 20201234, description: 'Student code' })
    @IsNumber()
    studentCode?: number;

    @ApiProperty({ example: 'juan@example.com', description: 'Email of the resident' })
    @IsString()
    email?: string;

    @ApiProperty({ example: 'Computer Science', description: 'Academic program' })
    @IsString()
    academicProgram?: string;

    @ApiProperty({ example: 'resident', description: 'Role of the resident' })
    @IsString()
    role?: string;

    @ApiProperty({ example: 'Scholarship', description: 'Benefit or activity assigned' })
    @IsString()
    benefitOrActivity?: string;

    @ApiProperty({ example: '2025-2', description: 'Current period' })
    @IsString()
    period?: string;

    @ApiProperty({ example: 2023, description: 'Admission year' })
    @IsNumber()
    admissionYear?: number;

    @ApiProperty({ example: '657890abcdef1234567890ab', description: 'Room ID assigned' })
    @IsString()
    room?: string;
}
