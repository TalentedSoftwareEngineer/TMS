import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NarResult, NarResultRelations} from '../models';

export class NarResultRepository extends DefaultCrudRepository<
  NarResult,
  typeof NarResult.prototype.id,
  NarResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(NarResult, dataSource);
  }
}
