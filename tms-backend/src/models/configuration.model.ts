import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'configuration'
})
export class Configuration extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  type: string;

  @property({
    type: 'string',
  })
  value: string;


  constructor(data?: Partial<Configuration>) {
    super(data);
  }
}

export interface ConfigurationRelations {
  // describe navigational properties here
}

export type ConfigurationWithRelations = Configuration & ConfigurationRelations;
