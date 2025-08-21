import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../../common/roles.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'Admin',
    enum: [
      'admin',
      'resident',
      'secretary_general',
      'president',
      'vice_president',
      'general_auditor',
      'adjudicator',
      'representative',
    ],
    description: 'Rol del usuario',
  })

  @IsOptional()
  @IsEnum(Role, { message: 'El rol no es válido' })
  readonly role?: Role;

    @ApiPropertyOptional({
    example: 'usuario@ejemplo.com',
    description:
      'Correo electrónico del usuario (se guarda en minúsculas aunque se ingrese con mayúsculas)',
  })

  @ApiPropertyOptional({
    example: true,
    description: 'Estado del usuario (activo/inactivo)',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser booleano' })
  readonly active?: boolean;

  @ApiPropertyOptional({
    example: 2,
    description: 'Piso que administra el representante (1–5)',
  })
  @IsOptional()
  @IsInt({ message: 'El piso debe ser un número entero' })
  @Min(1, { message: 'El piso mínimo es 1' })
  @Max(5, { message: 'El piso máximo permitido es 5' })
  readonly floor?: number;
}