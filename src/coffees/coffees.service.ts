import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';
import { LazyModuleLoader } from '@nestjs/core';

export const COFFEES_DATA_SOURCE = Symbol('COFFEES_DATA_SOURCE');
export interface CoffeeDataSource {
  [index: number]: Coffee;
}

@Injectable()
export class CoffeesService {
  constructor(
    @Inject(COFFEES_DATA_SOURCE) dataSource: CoffeeDataSource,
    private readonly lazyModuleLoader: LazyModuleLoader,

    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private datasource: DataSource,
    private readonly configService: ConfigService,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    // const databaseHost = this.configService.get('database.host', 'localhost');
    // console.log(databaseHost);
    // const coffeesConfig = this.configService.get('coffees');
    console.log(coffeesConfiguration.foo);
    console.log('CoffeesService instantiated');
    console.log(coffeeBrands);
  }

  async lazyCreate(createCoffeeDto: CreateCoffeeDto) {
    console.time();
    const rewardsModuleRef = await this.lazyModuleLoader.load(() =>
      import('../rewards/rewards.module').then((m) => m.RewardsModule),
    );
    const { RewardsService } = await import('../rewards/rewards.service');
    const rewardService = rewardsModuleRef.get(RewardsService);
    console.timeEnd();
    rewardService.grantTo();
    return 'This actions adds a new coffee';
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    const data = await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
    return data;
  }

  async findOne(id: number) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ['flavors'],
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
      ));

    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });
    if (existingFlavor) return existingFlavor;
    return this.flavorRepository.create({ name });
  }
}
