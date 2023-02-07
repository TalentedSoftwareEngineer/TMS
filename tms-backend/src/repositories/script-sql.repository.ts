import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ScriptSql, ScriptSqlRelations, User, ScriptUser} from '../models';
import {UserRepository} from './user.repository';
import {ScriptUserRepository} from './script-user.repository';

export class ScriptSqlRepository extends DefaultCrudRepository<
  ScriptSql,
  typeof ScriptSql.prototype.id,
  ScriptSqlRelations
> {

  public readonly created: BelongsToAccessor<User, typeof ScriptSql.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof ScriptSql.prototype.id>;

  public readonly user: BelongsToAccessor<ScriptUser, typeof ScriptSql.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ScriptUserRepository') protected scriptUserRepositoryGetter: Getter<ScriptUserRepository>,
  ) {
    super(ScriptSql, dataSource);
    this.user = this.createBelongsToAccessorFor('user', scriptUserRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
  }
}
