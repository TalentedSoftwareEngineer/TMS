import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TrqReq, TrqReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class TrqReqRepository extends DefaultCrudRepository<
  TrqReq,
  typeof TrqReq.prototype.id,
  TrqReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof TrqReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(TrqReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
