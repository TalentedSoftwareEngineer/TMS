import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MroReq, MroReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MroReqRepository extends DefaultCrudRepository<
  MroReq,
  typeof MroReq.prototype.id,
  MroReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof MroReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MroReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
