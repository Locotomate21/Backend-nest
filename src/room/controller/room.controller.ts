import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoomService } from '../room.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomResponseDto } from '../dto/room-response.dto';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // 🔹 Crear habitación
  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  async create(@Body() createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    try {
      return await this.roomService.create(createRoomDto);
    } catch (err) {
      throw new HttpException(
        {
          error: 'Failed to create room',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 🔹 Obtener todas las habitaciones
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  async getAll(): Promise<RoomResponseDto[]> {
    try {
      return await this.roomService.findAll();
    } catch (err) {
      throw new HttpException(
        {
          error: 'Failed to fetch rooms',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔹 Obtener una habitación por ID
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room found.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async findOne(@Param('id') id: string): Promise<RoomResponseDto> {
    return this.roomService.findOne(id);
  }

  // 🔹 Actualizar habitación
  @Put(':id')
  @ApiOperation({ summary: 'Update a room' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<RoomResponseDto> {
    try {
      return await this.roomService.update(id, updateRoomDto);
    } catch (err) {
      throw new HttpException(
        {
          error: 'Failed to update room',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 🔹 Eliminar habitación
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.roomService.remove(id);
      return { message: 'Room deleted successfully' };
    } catch (err) {
      throw new HttpException(
        {
          error: 'Failed to delete room',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 🔹 Obtener servicios de una habitación
  @Get(':roomId/services')
  @ApiOperation({ summary: 'Get services for a specific room' })
  async getRoomServices(@Param('roomId') roomId: string) {
    try {
      return await this.roomService.getRoomService(roomId);
    } catch (err) {
      throw new HttpException(
        {
          error: 'Error fetching services for the room',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔹 Sincronizar ocupación de habitaciones
  @Post('sync-occupancy')
  @ApiOperation({ summary: 'Sync room occupancy with residents' })
  async syncOccupancy(): Promise<{ message: string }> {
    try {
      await this.roomService.syncOccupancy();
      return { message: 'Room occupancy synchronized successfully' };
    } catch (err) {
      throw new HttpException(
        {
          error: 'Error syncing room occupancy',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
