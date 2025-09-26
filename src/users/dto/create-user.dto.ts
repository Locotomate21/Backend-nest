import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsEnum, IsBoolean, IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { Role } from '../../common/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'Leonardo Caballero',
    description: 'Nombre completo del usuario',
  })
  @IsString({ message: 'El nombre completo debe ser un texto' })
  fullName!: string;

  @ApiProperty({
    example: 'leonardo.caballero37406@ucaldas.edu.co',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (en texto plano al crear, luego se encripta)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'resident',
    enum: [
      'admin',
      'resident',
      'secretary_general',
      'president',
      'vice_president',
      'general_auditor',
      'floor_auditor',
      'adjudicator',
      'representative',
    ],
    description: 'Rol del usuario',
  })
  @IsEnum(Role, { message: 'El rol no es válido' })
  role!: Role;

  @ApiProperty({
    example: true,
    description: 'Estado del usuario (activo/inactivo)',
  })
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  active!: boolean;

  // 🔹 SOLO si es Representative
  @ApiProperty({
    example: 3,
    description: 'Piso que administra el representante (solo aplica si role = representative)',
    required: false,
  })
  @ValidateIf((o) => o.role === Role.Representative)
  @IsNumber({}, { message: 'El piso debe ser un número' })
  floor?: number;
}