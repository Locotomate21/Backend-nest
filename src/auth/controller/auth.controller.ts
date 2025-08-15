import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/public.decorator';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'Juan Pérez' },
        email: { type: 'string', example: 'juan.perez@example.com' },
        password: { type: 'string', example: '123456' },
        role: { type: 'string', example: 'Resident', nullable: true },
      },
      required: ['fullName', 'email', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    schema: { example: { message: 'Usuario registrado con éxito' } },
  })
  @ApiResponse({
    status: 409,
    schema: { example: { statusCode: 409, message: 'El usuario ya existe' } },
  })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Error desconocido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'juan.perez@example.com' },
        password: { type: 'string', example: '123456' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
        role: 'Admin',
        email: 'juan.perez@example.com',
        fullName: 'Juan Pérez',
      },
    },
  })
  @ApiResponse({
    status: 401,
    schema: { example: { statusCode: 401, message: 'Credenciales inválidas' } },
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Error desconocido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
