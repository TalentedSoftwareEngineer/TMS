import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MroResult, MroResultRelations} from '../models';

export class MroResultRepository extends DefaultCrudRepository<
  MroResult,
  typeof MroResult.prototype.id,
  MroResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MroResult, dataSource);
  }
}
