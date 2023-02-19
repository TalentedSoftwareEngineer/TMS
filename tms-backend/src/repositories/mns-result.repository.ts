import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnsResult, MnsResultRelations} from '../models';

export class MnsResultRepository extends DefaultCrudRepository<
  MnsResult,
  typeof MnsResult.prototype.id,
  MnsResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MnsResult, dataSource);
  }
}
