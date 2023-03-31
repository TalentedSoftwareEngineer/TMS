import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasOneRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ScriptResult, ScriptResultRelations, ScriptSql, User, ScriptProgress} from '../models';
import {ScriptSqlRepository} from './script-sql.repository';
import {UserRepository} from "./user.repository";
import {HttpErrors} from "@loopback/rest";
import {ScriptProgressRepository} from './script-progress.repository';

export class ScriptResultRepository extends DefaultCrudRepository<
  ScriptResult,
  typeof ScriptResult.prototype.id,
  ScriptResultRelations
> {

  public readonly user: BelongsToAccessor<User, typeof ScriptResult.prototype.id>;

  public readonly sql: BelongsToAccessor<ScriptSql, typeof ScriptResult.prototype.id>;

  public readonly scriptProgress: HasOneRepositoryFactory<ScriptProgress, typeof ScriptResult.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ScriptSqlRepository') protected scriptSqlRepositoryGetter: Getter<ScriptSqlRepository>, @repository.getter('ScriptProgressRepository') protected scriptProgressRepositoryGetter: Getter<ScriptProgressRepository>,
  ) {
    super(ScriptResult, dataSource);
    this.scriptProgress = this.createHasOneRepositoryFactoryFor('scriptProgress', scriptProgressRepositoryGetter);
    this.registerInclusionResolver('scriptProgress', this.scriptProgress.inclusionResolver);
    this.sql = this.createBelongsToAccessorFor('sql', scriptSqlRepositoryGetter,);
    this.registerInclusionResolver('sql', this.sql.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }

  public async getScriptSQL(id: typeof ScriptResult.prototype.id): Promise<string> {
    const sql = await this.sql(id).catch(err => {
      return null
    })

    return sql==null ? "" : sql.content
  }

  public async getProgress(id: typeof ScriptResult.prototype.id): Promise<string> {
    const p = await this.scriptProgress(id).get().catch(err => {
      return null
    })

    return p==null ? "" : p.status
  }

  public async updateProgress(id: typeof ScriptResult.prototype.id, status: string) {
    return this.scriptProgress(id).patch({status})
  }
}
