import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'db',
  connector: 'mysql',
  // url: 'mysql://root:@localhost',
  host: process.env.NODE_ENV=='production' ? 'localhost' : 'localhost',
  port: process.env.NODE_ENV=='production' ? 3306 : 3306,
  user: process.env.NODE_ENV=='production' ? 'root' : 'root',
  password: process.env.NODE_ENV=='production' ? 'D1pv@o22!!' : '',
  database: process.env.NODE_ENV=='production' ? 'tfnms' : 'tfnms',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
