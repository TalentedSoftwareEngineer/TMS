import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {MndReq, MndReqRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class MndReqRepository extends DefaultCrudRepository<
  MndReq,
  typeof MndReq.prototype.id,
  MndReqRelations
> {

  public readonly user: BelongsToAccessor<User, typeof MndReq.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(MndReq, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
