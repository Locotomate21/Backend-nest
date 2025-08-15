import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty()
  _id!: string;

  @ApiProperty()
  number!: number;

  @ApiProperty()
  floor!: number;

  @ApiProperty()
  occupied!: boolean;

  @ApiProperty({
    type: () => ({
      _id: String,
      fullName: String,
      idNumber: String,
    }),
    nullable: true,
  })
  currentResident!:
    | {
        _id: string;
        fullName: string;
        idNumber: string;
      }
    | string
    | null;

  @ApiProperty()
  __v!: number;
}