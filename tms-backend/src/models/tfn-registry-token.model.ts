import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'tfnregistry_token'
})
export class TfnRegistryToken extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  oouth_token: string;

  @property({
    type: 'string',
    required: true,
  })
  refresh_token: string;

  @property({
    type: 'string',
  })
  scope: string;

  @property({
    type: 'string',
    required: true,
  })
  client_key: string;

  @property({
    type: 'string',
    required: true,
  })
  client_secret: string;

  @property({
    type: 'string',
    required: true,
  })
  token_type: string;

  @property({
    type: 'number',
    required: true,
  })
  created_at: number;

  @property({
    type: 'number',
    required: true,
  })
  expires_at: number;


  constructor(data?: Partial<TfnRegistryToken>) {
    super(data);
  }
}

export interface TfnRegistryTokenRelations {
  // describe navigational properties here
}

export type TfnRegistryTokenWithRelations = TfnRegistryToken & TfnRegistryTokenRelations;
