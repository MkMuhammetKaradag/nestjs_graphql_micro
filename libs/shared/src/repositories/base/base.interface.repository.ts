import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface BaseInterfaceRepository<T> {
  create(data: DeepPartial<T>): T;
  createMany(data: DeepPartial<T>[]): T[];
  save(data: DeepPartial<T>): Promise<T>;
  update(id: number, data: QueryDeepPartialEntity<T>): Promise<UpdateResult>;
  saveMany(data: DeepPartial<T>[]): Promise<T[]>;
  findOneById(id: number): Promise<T>;
  findByCondition(filterCondition: FindOneOptions<T>): Promise<T>;
  pagination(options?: FindManyOptions<T>): Promise<[T[], number]>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  remove(data: T): Promise<T>;
  findWithRelations(relations: FindManyOptions<T>): Promise<T[]>;
  preload(entityLike: DeepPartial<T>): Promise<T>;
}
