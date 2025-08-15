import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class RegisterDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'Leonardo Caballero' })
  fullName!: string;

  @ApiProperty({ example: 'leonardo@ucaldas.edu.co' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}