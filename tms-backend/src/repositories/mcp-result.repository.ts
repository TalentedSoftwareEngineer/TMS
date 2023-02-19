import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {McpResult, McpResultRelations} from '../models';

export class McpResultRepository extends DefaultCrudRepository<
  McpResult,
  typeof McpResult.prototype.id,
  McpResultRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(McpResult, dataSource);
  }
}
