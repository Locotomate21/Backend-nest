import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({ example: '689105e68e15482831e9e38f' })
  _id!: string;

  @ApiProperty({
    example: {
      _id: '6891061f8e15482831e9e393',
      fullName: 'Miguel Angel Franco Moreno',
      idNumber: '123456',
    },
    nullable: true,
  })
  resident!: {
    _id: string;
    fullName: string;
    idNumber: string;
  } | null;

  @ApiProperty({ example: '2025-08-04T19:12:31.833Z' })
  date!: Date;

  @ApiProperty({ example: 'Daño en la ducha del baño' })
  reason!: string;

  @ApiProperty({ example: 'Se reemplazó la grifería', required: false })
  actionTaken?: string;
}
