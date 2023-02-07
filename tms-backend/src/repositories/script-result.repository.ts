import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ScriptResult, ScriptResultRelations, ScriptSql, User} from '../models';
import {ScriptSqlRepository} from './script-sql.repository';
import {UserRepository} from "./user.repository";

export class ScriptResultRepository extends DefaultCrudRepository<
  ScriptResult,
  typeof ScriptResult.prototype.id,
  ScriptResultRelations
> {

  public readonly user: BelongsToAccessor<User, typeof ScriptResult.prototype.id>;

  public readonly sql: BelongsToAccessor<ScriptSql, typeof ScriptResult.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ScriptSqlRepository') protected scriptSqlRepositoryGetter: Getter<ScriptSqlRepository>,
  ) {
    super(ScriptResult, dataSource);
    this.sql = this.createBelongsToAccessorFor('sql', scriptSqlRepositoryGetter,);
    this.registerInclusionResolver('sql', this.sql.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
