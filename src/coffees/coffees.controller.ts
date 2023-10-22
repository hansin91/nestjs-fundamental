import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  RequestTimeoutException,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { REQUEST } from '@nestjs/core';
import { Public } from '../common/decorators/public.decorator';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { Protocol } from '../common/decorators/protocol.decorator';
import { ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { CircuitBreakerInterceptor } from 'src/common/interceptors/circuit-breaker.interceptor';
import { EntityExistsPipe } from 'src/common/pipes/entity-exists.pipe';
import { Coffee } from './entities/coffee.entity';

@UseInterceptors(CircuitBreakerInterceptor)
@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
  constructor(
    private readonly coffeesService: CoffeesService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Public()
  @Get()
  async findAll(
    @Protocol('https') protocol: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    console.log(protocol);
    // testing timeout interceptors
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    // return this.coffeesService.findAll(paginationQuery);
    console.log('findAll executed');
    throw new RequestTimeoutException('Error');
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.coffeesService.findOne(id);
  }

  @Post('lazy')
  lazyCreate(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.lazyCreate(createCoffeeDto);
  }

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(
    // @Param('id', EntityExistsPipe(Coffee)) id: string,
    @Param('id') id: string,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
  ) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes #${id} coffee`;
  }
}
