import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Leonardo Caballero', description: 'Nombre completo del usuario' })
  fullName!: string;

  @ApiProperty({ example: 'leonardo.caballero37406@ucaldas.edu.co', description: 'Correo electrónico del usuario' })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario (en texto plano al crear, luego se encripta)' })
  password!: string;

  @ApiProperty({ 
    example: 'resident', 
    enum: ['admin', 
      'resident', 
      'secretary_general', 
      'president', 
      'vice_president', 
      'general_auditor', 
      'adjudicator'
    ], 
      description: 'Rol del usuario' })
  role!: string;

  @ApiProperty({ example: true, description: 'Estado del usuario (activo/inactivo)' })
  active!: boolean;
}