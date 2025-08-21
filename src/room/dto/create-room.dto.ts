import { IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty({ example: 101, description: 'Número de la habitación' })
  @IsNumber()
  @Type(() => Number) // 👈 fuerza conversión de string a number
  number!: number;

  @ApiProperty({ example: 1, description: 'Piso de la habitación' })
  @IsNumber()
  @Type(() => Number) // 👈 lo mismo para floor
  floor!: number;

  @ApiProperty({ example: false, description: 'Estado de ocupación' })
  @IsBoolean()
  occupied!: boolean;

  @ApiProperty({
    example: null,
    description: 'ID del residente actual si está ocupada, de lo contrario null',
    nullable: true,
  })
  currentResident!: string | null;
}
