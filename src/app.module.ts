import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { ResidentModule } from './resident/resident.module';
import { RoomModule } from './room/room.module';
import { ReportModule } from './reports/report.module';
import { UserModule } from './users/user.module';

import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { StatsModule } from './stats/stats.module';
import { NewsModule } from './news/news.module';
import { AssemblyModule } from './assemblies/assembly.module';

@Module({
  imports: [
    // 📌 Configuración de variables de entorno global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 📌 Conexión a MongoDB
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://CarlosSoft:locotomate21@cluster0.ujsug4w.mongodb.net/residents_rooms?retryWrites=true&w=majority',
    ),

    // 📌 Módulos de la aplicación
    UserModule,
    AuthModule,
    ResidentModule,
    RoomModule,
    ReportModule,
    StatsModule,
    NewsModule,
    AssemblyModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
