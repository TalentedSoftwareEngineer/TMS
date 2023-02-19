import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnsReq, MnsReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MnsReqRepository extends DefaultCrudRepository<
  MnsReq,
  typeof MnsReq.prototype.id,
  MnsReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof MnsReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MnsReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
