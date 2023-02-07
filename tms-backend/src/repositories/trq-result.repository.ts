import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TrqResult, TrqResultRelations} from '../models';

export class TrqResultRepository extends DefaultCrudRepository<
  TrqResult,
  typeof TrqResult.prototype.id,
  TrqResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(TrqResult, dataSource);
  }
}
