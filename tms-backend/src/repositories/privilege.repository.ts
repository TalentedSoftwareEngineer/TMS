import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Privilege, PrivilegeRelations} from '../models';

export class PrivilegeRepository extends DefaultCrudRepository<
  Privilege,
  typeof Privilege.prototype.id,
  PrivilegeRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Privilege, dataSource);
  }
}
