import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomService } from '../../room/room.service';
import { CreateRoomDto } from '../../room/dto/create-room.dto';
import { UpdateRoomDto } from '../../room/dto/update-room.dto';
import { RoomResponseDto } from '../../room/dto/room-response.dto';

@Controller('resident')
export class ResidentController {
  @Get()
  findAll() {
    return 'List of residents';
  }
}

@ApiTags('Rooms Module')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  async create(@Body() createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  async findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a room' })
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room' })
  async remove(@Param('id') id: string) {
    await this.roomService.remove(id);
  }

  // Aquí puedes agregar endpoints extras, ej. sincronizar ocupación
}
