import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ScriptProgress, ScriptProgressRelations} from '../models';

export class ScriptProgressRepository extends DefaultCrudRepository<
  ScriptProgress,
  typeof ScriptProgress.prototype.id,
  ScriptProgressRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(ScriptProgress, dataSource);
  }
}
