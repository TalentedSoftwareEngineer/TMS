import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {SomosUser, SomosUserRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class SomosUserRepository extends DefaultCrudRepository<
  SomosUser,
  typeof SomosUser.prototype.id,
  SomosUserRelations
> {

  public readonly created: BelongsToAccessor<User, typeof SomosUser.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof SomosUser.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(SomosUser, dataSource);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
  }
}
