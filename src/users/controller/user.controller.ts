import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({
    description: 'Datos para crear un usuario',
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Usuario residente activo',
        value: {
          fullName: 'Leonardo Caballero',
          email: 'leonardo.caballero@ucaldas.edu.co',
          password: 'password123',
          role: 'resident',
          active: true,
        },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return 'Usuario creado';
  }

  
  constructor(private readonly userService: UserService) {}

  // 🟢 Crear un nuevo usuario
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error; // Si ya es un HttpException, relanzarlo
      }
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Error desconocido al crear usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📋 Obtener todos los usuarios
  @Get()
  async getAllUsers() {
    try {
      return await this.userService.getAllUser();
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Error desconocido al obtener usuarios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔍 Obtener un usuario por ID
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      return await this.userService.getUserById(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Error desconocido al obtener usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✏️ Actualizar un usuario
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', example: '64b0e0d4f9a3c6a1b8a0c123' })
  @ApiBody({
    description: 'Datos para actualizar un usuario',
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Actualizar nombre y estado',
        value: {
          fullName: 'Leonardo C. Actualizado',
          active: false,
        },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return `Usuario ${id} actualizado`;
  }

  // ❌ Eliminar un usuario
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.userService.deleteUser(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Error desconocido al eliminar usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
