import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnqResult, MNQResultRelations} from '../models';

export class MnqResultRepository extends DefaultCrudRepository<
  MnqResult,
  typeof MnqResult.prototype.id,
  MNQResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MnqResult, dataSource);
  }
}
