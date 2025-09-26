import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('App') // Categoría en Swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint público
  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint protegido con JWT
  @ApiBearerAuth('jwt') // Coincide con el nombre definido en main.ts
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(): string {
    return 'Este endpoint requiere JWT válido';
  }
}
