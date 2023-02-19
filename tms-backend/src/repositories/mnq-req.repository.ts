import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MnqReq, MnqReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MnqReqRepository extends DefaultCrudRepository<
  MnqReq,
  typeof MnqReq.prototype.id,
  MnqReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof MnqReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MnqReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
