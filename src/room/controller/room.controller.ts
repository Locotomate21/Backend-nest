import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { RoomService } from '../room.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomResponseDto } from '../dto/room-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../common/roles.enum';

  @ApiTags('Rooms')
  @ApiBearerAuth('jwt')
  @Controller('rooms')
  export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  // 🔹 Crear habitación
  @Roles(Role.Admin, Role.Representative) // Only admins and representatives can create a room
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  async create(@Body() createRoomDto: CreateRoomDto, @Request() req): Promise<RoomResponseDto> {
    try {
      return await this.roomService.create(createRoomDto, req.user);
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
  @Roles(Role.Admin, Role.Representative)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all rooms' })
  async getAll(@Request() req): Promise<RoomResponseDto[]> {
    try {
      return await this.roomService.findAll(req.user);
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
  @Roles(Role.Admin, Role.Representative) // Only admins and representatives can get a room by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room found.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async findOne(@Param('id') id: string, @Request() req): Promise<RoomResponseDto> {
    return this.roomService.findOne(id, req.user);
  }

  // 🔹 Actualizar habitación
  @Roles(Role.Admin, Role.Representative) // Solo admins y representantes pueden actualizar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto }) // Swagger tomará los ejemplos del DTO
  @ApiResponse({ status: 200, description: 'Room updated successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to update room.' })
  async update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req,
  ): Promise<RoomResponseDto> {
    try {
      return await this.roomService.update(id, updateRoomDto, req.user);
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
  @Roles(Role.Admin, Role.Representative) // Only admins and representatives can delete a room
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room' })
  async delete(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    try {
      await this.roomService.remove(id, req.user);
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
  @Roles(Role.Admin, Role.Representative) // Only admins and representatives can get services for a room
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':roomId/services')
  @ApiOperation({ summary: 'Get services for a specific room' })
  async getRoomServices(@Param('roomId') roomId: string, @Request() req) {
    try {
      return await this.roomService.getRoomService(roomId, req.user);
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
  @Roles(Role.Admin, Role.Representative) // Only admins and representatives can sync room occupancy
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('sync-occupancy')
  @ApiOperation({ summary: 'Sync room occupancy with residents' })
  async syncOccupancy(@Request() req): Promise<{ message: string }> {
    try {
      await this.roomService.syncOccupancy(req.user);
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
