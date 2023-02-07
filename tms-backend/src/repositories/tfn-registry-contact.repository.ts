import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {TfnRegistryContact, TfnRegistryContactRelations} from '../models';

export class TfnRegistryContactRepository extends DefaultCrudRepository<
  TfnRegistryContact,
  typeof TfnRegistryContact.prototype.id,
  TfnRegistryContactRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(TfnRegistryContact, dataSource);
  }
}
