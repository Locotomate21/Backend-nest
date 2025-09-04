import { Body, Controller, Delete, Get, Param, Post, Req, HttpException, HttpStatus, UseGuards, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiBody, } from '@nestjs/swagger';
import { NewsService } from '../news.service';
import { CreateNewsDto } from '../dto/create-news.dto';
import { Roles } from '../../auth/roles.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Role } from '../../common/roles.enum';

@ApiTags('News')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // ✅ CREATE
  @Post()
  @Roles(Role.Representative, Role.Admin, Role.President, Role.SecretaryGeneral)
  @ApiOperation({ summary: 'Crear una noticia (según rol y tipo)' })
  @ApiBody({
    type: CreateNewsDto,
    schema: {
      example: {
        title: 'Fumigación',
        content: 'Se fumigará la casa el lunes a las 2:00 PM',
        type: 'general', // "general" o "floor"
        floor: 2,        // solo se requiere si type = "floor"
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Noticia creada correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para crear esta noticia' })
  async create(@Body() dto: CreateNewsDto, @Req() req: any) {
    try {
      return await this.newsService.create(dto, req.user);
    } catch (err) {
      throw new HttpException(
        {
          error: 'Failed to create news',
          details: err instanceof Error ? err.message : String(err),
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ✅ READ ALL
  @Get()
  @Roles(Role.Representative, Role.Admin, Role.Resident, Role.President, Role.SecretaryGeneral)
  @ApiOperation({ summary: 'Obtener todas las noticias (filtradas por rol/piso)' })
  @ApiResponse({ status: 200, description: 'Lista de noticias obtenida correctamente' })
  async findAll(@Req() req: any) {
    return this.newsService.findAll(req.user);
  }

  // ✅ READ by ID
  @Get(':id')
  @Roles(Role.Representative, Role.Admin, Role.Resident, Role.President, Role.SecretaryGeneral)
  @ApiOperation({ summary: 'Obtener una noticia por ID (con restricciones por rol/piso)' })
  @ApiResponse({ status: 200, description: 'Noticia obtenida correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para ver esta noticia' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.newsService.findOne(id, req.user);
  }

  // ✅ DELETE
  @Delete(':id')
  @Roles(Role.Representative, Role.Admin, Role.President, Role.SecretaryGeneral)
  @ApiOperation({ summary: 'Eliminar una noticia (según permisos)' })
  @ApiResponse({ status: 200, description: 'Noticia eliminada correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar esta noticia' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.newsService.delete(id, req.user);
    return { message: 'Noticia eliminada correctamente' };
  }
}
