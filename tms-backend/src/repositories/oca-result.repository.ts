import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {OcaResult, OcaResultRelations} from '../models';

export class OcaResultRepository extends DefaultCrudRepository<
  OcaResult,
  typeof OcaResult.prototype.id,
  OcaResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(OcaResult, dataSource);
  }
}
