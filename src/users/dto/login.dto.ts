import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'leonardo@ucaldas.edu.co' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}
