import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTestUsers, usersData } from './database/seeders/users.seeder';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  const port = config.get<number>('PORT');

  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PayNest API')
    .setDescription('The paynest API description')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, async() => {
    Logger.log(`http://localhost:${config.get<string>('PORT')}`, 'API');
    Logger.log(`http://localhost:${config.get<string>('PORT')}/docs`, 'DOCS');

    if (config.get<string>('ENV') === 'dev') {
      await createNewUser(app);
    }
  });
}

async function createNewUser(app: INestApplication) {
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const hasUsers = await userRepository.find();

  if (hasUsers) { // test users already created
    return;
  }

  const testUsers = await createTestUsers(usersData);

  try {
    await userRepository.save(testUsers);
    Logger.log('New users created successfully.', 'Database');
  } catch (error) {
    Logger.error('Error creating new users.', error, 'Database');
  }
}

bootstrap();
