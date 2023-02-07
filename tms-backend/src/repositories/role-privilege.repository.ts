import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {RolePrivilege, RolePrivilegeRelations, Privilege} from '../models';
import {PrivilegeRepository} from './privilege.repository';

export class RolePrivilegeRepository extends DefaultCrudRepository<
  RolePrivilege,
  typeof RolePrivilege.prototype.id,
  RolePrivilegeRelations
> {

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(RolePrivilege, dataSource);
  }
}
