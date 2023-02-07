import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Company, CompanyRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class CompanyRepository extends DefaultCrudRepository<
  Company,
  typeof Company.prototype.id,
  CompanyRelations
> {

  public readonly created: BelongsToAccessor<User, typeof Company.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof Company.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Company, dataSource);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
  }
}
