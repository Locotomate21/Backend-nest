import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from '../auth/controller/auth.controller';
import { UserModule } from '../users/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';  // 👈 tu guard JWT
import { JwtStrategy } from './jwt.strategy';     // 👈 tu estrategia JWT

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'mysecretkey'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // 👈 registra la estrategia
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 👈 primero JWT
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,   // 👈 luego roles
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
