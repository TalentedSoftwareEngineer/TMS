import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {ActivityResult, ActivityResultRelations, User, Activity} from '../models';
import {UserRepository} from './user.repository';
import {ActivityRepository} from './activity.repository';

export class ActivityResultRepository extends DefaultCrudRepository<
  ActivityResult,
  typeof ActivityResult.prototype.id,
  ActivityResultRelations
> {

  public readonly user: BelongsToAccessor<User, typeof ActivityResult.prototype.id>;

  public readonly activity: BelongsToAccessor<Activity, typeof ActivityResult.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('ActivityRepository') protected activityRepositoryGetter: Getter<ActivityRepository>,
  ) {
    super(ActivityResult, dataSource);
    this.activity = this.createBelongsToAccessorFor('activity', activityRepositoryGetter,);
    this.registerInclusionResolver('activity', this.activity.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
