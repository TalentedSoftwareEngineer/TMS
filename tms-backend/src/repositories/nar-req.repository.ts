import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NarReq, NarReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class NarReqRepository extends DefaultCrudRepository<
  NarReq,
  typeof NarReq.prototype.id,
  NarReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof NarReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(NarReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
