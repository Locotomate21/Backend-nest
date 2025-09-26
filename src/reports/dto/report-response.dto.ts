import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({ example: '689105e68e15482831e9e38f' })
  _id!: string;

  @ApiProperty({
    example: {
      _id: '6891061f8e15482831e9e393',
      fullName: 'Miguel Angel Franco Moreno',
      idNumber: '123456',
      studentCode: '123456789',
      room: {
        _id: '6891061f8e15482831e9e393',
        number: '101',
        floor: 1,
      },
    },
    nullable: true,
    required: false,
    description: 'Residente vinculado al reporte (si está populado)',
  })
  resident?: {
    _id: string;
    fullName: string;
    idNumber: string;
    studentCode: string;
    room: {
      _id: string | null;
      number: string;
      floor: number;
    } | null;
  } | null;

  @ApiProperty({
    example: '2025-09-13T15:45:00.000Z',
    description: 'Fecha en que se generó el reporte',
  })
  date!: Date;

  @ApiProperty({
    example: 'Daño en la ducha del baño',
    description: 'Motivo o razón principal del reporte',
  })
  reason!: string;

  @ApiProperty({
    example: 'Se reemplazó la grifería',
    required: false,
    description: 'Medida correctiva o acción tomada',
  })
  actionTaken?: string;

  @ApiProperty({
    example: {
      _id: '68a48cd0b3a7ee4948183623',
      fullName: 'Ferney Peralta',
      email: 'fernando@example.com',
      role: 'representative',
      resident: {
        _id: '6891061f8e15482831e9e393',
        fullName: 'Miguel Angel Franco Moreno',
        studentCode: '202012345',
        room: {
          _id: '6891061f8e15482831e9e393',
          number: '101',
          floor: 1,
        },
      },
    },
    nullable: true,
    required: false,
    description: 'Usuario (representante/admin) que creó el reporte',
  })
  createdBy?: {
    _id: string | null;
    fullName: string;
    email: string;
    role: string;
    resident?: {
      _id: string | null;
      fullName: string;
      studentCode: string;
      room: {
        _id: string | null;
        number: string;
        floor: number;
      } | null;
    } | null;
  } | null;
}
