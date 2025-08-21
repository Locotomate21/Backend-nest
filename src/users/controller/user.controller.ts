import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../common/roles.enum';
import { Roles } from '../../common/roles.decorator';

@ApiTags('User')
@ApiBearerAuth('jwt') // Indica a Swagger que todas las rutas requieren jwt
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard) // Se aplica a todos los endpoints
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.Admin, Role.Representative)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error desconocido al crear usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin, Role.Representative)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  async getAllUsers() {
    try {
      return await this.userService.findAll();
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error desconocido al obtener usuarios', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin, Role.Representative)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async getUserById(@Param('id') id: string) {
    try {
      return await this.userService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error desconocido al obtener usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin, Role.Representative)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error desconocido al actualizar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles(Role.Admin, Role.Representative)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  async deleteUser(@Param('id') id: string) {
    try {
      return await this.userService.remove(id);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error desconocido al eliminar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
