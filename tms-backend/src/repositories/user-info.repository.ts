import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {UserInfo, UserInfoRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class UserInfoRepository extends DefaultCrudRepository<
  UserInfo,
  typeof UserInfo.prototype.id,
    UserInfoRelations
> {

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(UserInfo, dataSource);
  }
}
