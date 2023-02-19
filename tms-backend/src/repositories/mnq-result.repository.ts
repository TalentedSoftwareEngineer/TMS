import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnqResult, MnqResultRelations} from '../models';

export class MnqResultRepository extends DefaultCrudRepository<
  MnqResult,
  typeof MnqResult.prototype.id,
  MnqResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MnqResult, dataSource);
  }
}
