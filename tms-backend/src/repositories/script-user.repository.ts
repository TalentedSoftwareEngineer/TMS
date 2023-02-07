import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ScriptUser, ScriptUserRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class ScriptUserRepository extends DefaultCrudRepository<
  ScriptUser,
  typeof ScriptUser.prototype.id,
  ScriptUserRelations
> {

  public readonly created: BelongsToAccessor<User, typeof ScriptUser.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof ScriptUser.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(ScriptUser, dataSource);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
  }
}
