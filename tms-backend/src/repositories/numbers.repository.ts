import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Numbers, NumbersRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class NumbersRepository extends DefaultCrudRepository<
  Numbers,
  typeof Numbers.prototype.id,
  NumbersRelations
> {

  public readonly created: BelongsToAccessor<User, typeof Numbers.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof Numbers.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Numbers, dataSource);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
  }
}
