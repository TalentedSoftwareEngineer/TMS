import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnaResult, MnaResultRelations} from '../models';

export class MnaResultRepository extends DefaultCrudRepository<
  MnaResult,
  typeof MnaResult.prototype.id,
  MnaResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(MnaResult, dataSource);
  }
}
