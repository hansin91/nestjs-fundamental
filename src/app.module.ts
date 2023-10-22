import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../db/data-source';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { CronModule } from './cron/cron.module';
import { FibonacciModule } from './fibonacci/fibonacci.module';
import { HttpClientModule } from './http-client/http-client.module';
import { RecipesModule } from './recipes/recipes.module';
import { TagsModule } from './tags/tags.module';
import * as Joi from '@hapi/joi';
import appConfig from './config/app.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentsModule } from './payments/payments.module';
import { DataSourceModule } from './data-source/data-source.module';
import { UsersModule } from './users/users.module';
import { ContextIdFactory } from '@nestjs/core';
import { I18nModule } from './i18n/i18n.module';
import { AggregateByLocaleContextIdStrategy } from './core/aggregate-by-locale.strategy';

// ContextIdFactory.apply(new AggregateByTenantContextIdStrategy());
ContextIdFactory.apply(new AggregateByLocaleContextIdStrategy());

@Module({
  imports: [
    // async module
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => dataSourceOptions,
    // }),
    // load postgresSQL
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
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
    // SchedulerModule,
    CronModule,
    FibonacciModule,
    HttpClientModule.register({
      baseUrl: 'https://nestjs.com',
    }),
    RecipesModule,
    TagsModule,
    PaymentsModule,
    DataSourceModule,
    UsersModule,
    I18nModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
