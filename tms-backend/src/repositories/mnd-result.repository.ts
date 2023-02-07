import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MndResult, MndResultRelations} from '../models';

export class MndResultRepository extends DefaultCrudRepository<
  MndResult,
  typeof MndResult.prototype.id,
  MndResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MndResult, dataSource);
  }
}
