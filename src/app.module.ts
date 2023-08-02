import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import * as Joi from '@hapi/joi';
import appConfig from './config/app.config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // async module
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => dataSourceOptions,
    // }),
    // load mongodb
    MongooseModule.forRoot(
      'mongodb+srv://superadmin:V3zON16D8BvPOn8c@cluster0.lyep1qf.mongodb.net/?retryWrites=true&w=majority',
    ),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
      }),
      load: [appConfig],
    }),
    CoffeesModule,
    CoffeeRatingModule,
    DatabaseModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
