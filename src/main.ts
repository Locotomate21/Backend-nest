import { NestFactory } from '@nestjs/core'; 
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
      origin: [
        'http://localhost:5173',
        'https://residenciasgsb.netlify.app', // dominio de tu frontend
      ],
      credentials: true,
    });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API RGSB')
    .setDescription('Residencias Gabriel Soto Bayona')
    .setVersion('1.0')
    // Definimos el esquema Bearer JWT
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese el token JWT aqui',
        in: 'header',
      },
      'jwt', // Nombre del esquema para Swagger
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Aplicación corriendo en http://localhost:3000`);
  console.log(`📄 Documentación Swagger en http://localhost:3000/api-docs`);
}
bootstrap();
