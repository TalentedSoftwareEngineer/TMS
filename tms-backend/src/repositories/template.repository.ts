import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Template, TemplateRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class TemplateRepository extends DefaultCrudRepository<
  Template,
  typeof Template.prototype.id,
  TemplateRelations
> {

  public readonly created: BelongsToAccessor<User, typeof Template.prototype.id>;

  public readonly updated: BelongsToAccessor<User, typeof Template.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Template, dataSource);
    this.updated = this.createBelongsToAccessorFor('updated', userRepositoryGetter,);
    this.registerInclusionResolver('updated', this.updated.inclusionResolver);
    this.created = this.createBelongsToAccessorFor('created', userRepositoryGetter,);
    this.registerInclusionResolver('created', this.created.inclusionResolver);
  }
}
