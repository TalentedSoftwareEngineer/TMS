import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {OcaReq, OcaReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class OcaReqRepository extends DefaultCrudRepository<
  OcaReq,
  typeof OcaReq.prototype.id,
  OcaReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof OcaReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(OcaReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
