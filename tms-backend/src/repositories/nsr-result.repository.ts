import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NsrResult, NsrResultRelations, NsrReq} from '../models';

export class NsrResultRepository extends DefaultCrudRepository<
  NsrResult,
  typeof NsrResult.prototype.id,
  NsrResultRelations
> {

  public readonly nsr_req: BelongsToAccessor<NsrReq, typeof NsrResult.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(NsrResult, dataSource);
  }
}
