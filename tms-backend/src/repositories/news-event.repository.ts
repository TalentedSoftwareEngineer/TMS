import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {NewsEvent, NewsEventRelations} from '../models';

export class NewsEventRepository extends DefaultCrudRepository<
  NewsEvent,
  typeof NewsEvent.prototype.id,
  NewsEventRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(NewsEvent, dataSource);
  }
}
