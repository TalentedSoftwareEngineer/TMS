import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NsrReq, NsrReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class NsrReqRepository extends DefaultCrudRepository<
  NsrReq,
  typeof NsrReq.prototype.id,
  NsrReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof NsrReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(NsrReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
