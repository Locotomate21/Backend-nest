import { IsString, IsInt, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResidentDto {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsInt()
  idNumber!: number;

  @ApiProperty()
  @IsInt()
  studentCode!: number;

  @ApiProperty()
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  academicProgram!: string;

  @ApiProperty()
  @IsString()
  role!: string;

  @ApiProperty()
  @IsString()
  benefitOrActivity!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  admissionYear?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Room ID. Will be linked to the corresponding Room ObjectId automatically', 
    example: "657890abcdef1234567890ab" 
  })
  
  @IsOptional()
  @IsString()
  room?: string;  

  @ApiProperty({ required: false, readOnly: true })
  @IsOptional()
  @IsDate()
  enrollmentDate?: Date;

  // 👇 Aquí está la clave que faltaba
  @ApiProperty({ 
    description: 'ID del usuario asociado al residente',
    example: "657890abcdef1234567890ab"
  })
  @IsString()
  @IsOptional()
  user?: string;
}
