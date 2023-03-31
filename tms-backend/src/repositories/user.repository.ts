import {inject, Getter} from '@loopback/core';
import {
    DefaultCrudRepository,
    repository,
    BelongsToAccessor,
    HasOneRepositoryFactory,
    DefaultTransactionalRepository
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
// @ts-ignore
import {User, UserRelations, Company, UserCredentials, SomosUser, UserInfo, Role} from '../models';
import {CompanyRepository} from './company.repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserInfoRepository} from './user-info.repository';
import {SomosUserRepository} from './somos-user.repository';
import {RoleRepository} from './role.repository';

export class UserRepository extends DefaultTransactionalRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly userCredentials: HasOneRepositoryFactory<UserCredentials, typeof User.prototype.id>;

  public readonly userInfo: HasOneRepositoryFactory<UserInfo, typeof User.prototype.id>;

  public readonly company: BelongsToAccessor<Company, typeof User.prototype.id>;

  public readonly somosUser: BelongsToAccessor<SomosUser, typeof User.prototype.id>;

  public readonly role: BelongsToAccessor<Role, typeof User.prototype.id>;

  constructor(
      @inject('datasources.db') dataSource: DbDataSource, @repository.getter('UserCredentialsRepository') protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>, @repository.getter('UserInfoRepository') protected userInfoRepositoryGetter: Getter<UserInfoRepository>, @repository.getter('CompanyRepository') protected companyRepositoryGetter: Getter<CompanyRepository>, @repository.getter('SomosUserRepository') protected somosUserRepositoryGetter: Getter<SomosUserRepository>, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(User, dataSource);
    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter,);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
    this.somosUser = this.createBelongsToAccessorFor('somosUser', somosUserRepositoryGetter,);
    this.registerInclusionResolver('somosUser', this.somosUser.inclusionResolver);
    this.company = this.createBelongsToAccessorFor('company', companyRepositoryGetter,);
    this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.userInfo = this.createHasOneRepositoryFactoryFor('userInfo', userInfoRepositoryGetter);
    this.registerInclusionResolver('userInfo', this.userInfo.inclusionResolver);
    this.userCredentials = this.createHasOneRepositoryFactoryFor('userCredentials', userCredentialsRepositoryGetter);
  }

  async getCredentials(
      userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    return this.userCredentials(userId)
        .get()
        .catch(err => {
          if (err.code === 'ENTITY_NOT_FOUND') return undefined;
          throw err;
        });
  }

  async getInfo(
      userId: typeof User.prototype.id,
  ): Promise<UserInfo | undefined> {
    return this.userInfo(userId)
        .get()
        .catch(err => {
          if (err.code === 'ENTITY_NOT_FOUND') return undefined;
          throw err;
        });
  }

    async getCompany(
        userId: typeof User.prototype.id,
    ): Promise<Company | undefined> {
        return this.company(userId)
            .catch(err => {
                if (err.code === 'ENTITY_NOT_FOUND') return undefined;
                throw err;
            });
    }

    async getSomosUser(
        userId: typeof User.prototype.id,
    ): Promise<SomosUser | undefined> {
        return this.somosUser(userId)
            .catch(err => {
                if (err.code === 'ENTITY_NOT_FOUND') return undefined;
                throw err;
            });
    }
}
