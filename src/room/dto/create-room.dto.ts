import { IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 101, description: 'Número de la habitación' })
  @IsNumber()
  number!: number;

  @ApiProperty({ example: 1, description: 'Piso de la habitación' })
  @IsNumber()
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
