    import { PartialType } from '@nestjs/mapped-types';
    import { CreateResidentDto } from './create-resident.dto';
    import { ApiProperty } from '@nestjs/swagger';
    import { IsOptional, Matches, IsString, IsNumber, IsEmail } from 'class-validator';

    export class UpdateResidentDto extends PartialType(CreateResidentDto) {
    @ApiProperty({ example: 'Juan Pérez', description: 'Full name of the resident', required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ example: 123456, description: 'ID number of the resident', required: false })
    @IsOptional()
    @IsNumber()
    idNumber?: number;

    @ApiProperty({ example: 20201234, description: 'Student code', required: false })
    @IsOptional()
    @IsNumber()
    studentCode?: number;

    @ApiProperty({ example: 'juan@example.com', description: 'Email of the resident', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: 'Computer Science', description: 'Academic program', required: false })
    @IsOptional()
    @IsString()
    academicProgram?: string;

    @ApiProperty({ example: 'resident', description: 'Role of the resident', required: false })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({ example: 'Scholarship', description: 'Benefit or activity assigned', required: false })
    @IsOptional()
    @IsString()
    benefitOrActivity?: string;

    @ApiProperty({ example: '2025-2', description: 'Current period', required: false })
    @IsOptional()
    @IsString()
    period?: string;

    @ApiProperty({ example: 2023, description: 'Admission year', required: false })
    @IsOptional()
    @IsNumber()
    admissionYear?: number;

    @ApiProperty({ example: '657890abcdef1234567890ab', description: 'Room ID assigned', required: false })
    @IsOptional()
    @IsString()
    room?: string;

    @ApiProperty({ example: 3137342456, description: 'Phone number of the resident', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{7,15}$/, { message: 'El teléfono debe contener solo dígitos (10 digitos)' })
    phone?: string;
    }
