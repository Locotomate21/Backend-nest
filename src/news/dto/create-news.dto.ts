import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiProperty({
    description: 'Título de la noticia',
    example: 'Fumigación',
  })
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Contenido completo de la noticia',
    example:
      'Se fumigará la casa el lunes a las 2:00 PM.',
  })
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Tipo de noticia: general o floor',
    example: 'general',
    enum: ['general', 'floor'],
  })
  @IsIn(['general', 'floor'])
  type?: 'general' | 'floor';

  @ApiProperty({
    description: 'Piso al que aplica la noticia (solo si es de piso)',
    example: 2,
    required: false,
  })
  @IsOptional()
  floor?: number;
}
