import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnaReq, MnaReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MnaReqRepository extends DefaultCrudRepository<
  MnaReq,
  typeof MnaReq.prototype.id,
  MnaReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof MnaReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MnaReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
