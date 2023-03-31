import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TfnRegistryToken, TfnRegistryTokenRelations} from '../models';
import DateTimeUtils from "../utils/datetime";

export class TfnRegistryTokenRepository extends DefaultCrudRepository<
  TfnRegistryToken,
  typeof TfnRegistryToken.prototype.id,
  TfnRegistryTokenRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(TfnRegistryToken, dataSource);
  }

  async saveFromTfnRegistry(id: number, res: any, somos?: any): Promise<TfnRegistryToken> {
    let isNew = false;
    let token = await this.findOne({ where: {id: id}})
    if (!token) {
      token = new TfnRegistryToken()
      isNew = true;
    }

    token.id = id;
    if (res.oauthToken)
      token.oouth_token = res.oauthToken
    else if (res.access_token)
      token.oouth_token = res.access_token

    if (res.refreshToken)
      token.refresh_token = res.refreshToken
    else if (res.refresh_token)
      token.refresh_token = res.refresh_token

    token.scope = res.scope;

    if (res.tokenType)
      token.token_type = res.tokenType
    else if (res.token_type)
      token.token_type = res.token_type

    if (res.clientKey)
      token.client_key = res.clientKey
    else if (somos)
      token.client_key = somos.client_key

    if (res.clientSecret)
      token.client_secret = res.clientSecret
    else if (somos)
      token.client_secret = somos.client_secret

    const now = DateTimeUtils.getCurrentTimestamp();
    token.created_at = now

    if (res.expiresIn)
      token.expires_at = now + Number(res.expiresIn)
    else if (res.expires_in)
      token.expires_at = now + Number(res.expires_in)

    return isNew ? await this.create(token) : await this.save(token)
  }

}
