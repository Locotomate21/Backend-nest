import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from '../dto/create-room.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    @ApiProperty({ example: 101 })
    number?: number;

    @ApiProperty({ example: 1 })
    floor?: number;

    @ApiProperty({ example: false })
    occupied?: boolean;

    @ApiProperty({ example: null })
    currentResident?: string | null;
}

