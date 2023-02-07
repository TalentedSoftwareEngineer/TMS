import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NsrResult, NSRResultRelations, NsrReq} from '../models';

export class NsrResultRepository extends DefaultCrudRepository<
  NsrResult,
  typeof NsrResult.prototype.id,
  NSRResultRelations
> {

  public readonly nsr_req: BelongsToAccessor<NsrReq, typeof NsrResult.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(NsrResult, dataSource);
  }
}
