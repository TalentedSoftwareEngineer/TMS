import {inject, Getter} from '@loopback/core';
import {
    DefaultCrudRepository,
    repository,
    HasManyRepositoryFactory,
    BelongsToAccessor,
    DefaultTransactionalRepository
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Role, RoleRelations, RolePrivilege, User} from '../models';
import {RolePrivilegeRepository} from './role-privilege.repository';
import {UserRepository} from './user.repository';

export class RoleRepository extends DefaultTransactionalRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
> {

  public readonly rolePrivileges: HasManyRepositoryFactory<RolePrivilege, typeof Role.prototype.id>;

  public readonly created: BelongsToAccessor<User, typeof Role.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof Role.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('RolePrivilegeRepository') protected rolePrivilegeRepositoryGetter: Getter<RolePrivilegeRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Role, dataSource);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
    this.rolePrivileges = this.createHasManyRepositoryFactoryFor('rolePrivileges', rolePrivilegeRepositoryGetter,);
    this.registerInclusionResolver('rolePrivileges', this.rolePrivileges.inclusionResolver);
  }

  async getPrivileges(
      roleId: typeof Role.prototype.id,
  ): Promise<RolePrivilege[] | undefined> {
    return this.rolePrivileges(roleId)
        .find()
        .catch(err => {
          if (err.code === 'ENTITY_NOT_FOUND') return undefined;
          throw err;
        });
  }

  async getPermissions(roleId: number) {
      let result : number[] = []
      const privileges = await this.getPrivileges(roleId)
      if (privileges) {
          result = privileges.map(item => item.privilege_id)
      }

      return result
  }
}
