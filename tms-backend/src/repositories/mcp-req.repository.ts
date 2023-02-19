import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {McpReq, McpReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class McpReqRepository extends DefaultCrudRepository<
  McpReq,
  typeof McpReq.prototype.id,
  McpReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof McpReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(McpReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
