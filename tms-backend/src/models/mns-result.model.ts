import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'mns_result'
})
export class MnsResult extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    defaultFn: 'uuidv4'
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  req_id: string;

  @property({
    type: 'string',
  })
  num?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;


  constructor(data?: Partial<MnsResult>) {
    super(data);
  }
}

export interface MnsResultRelations {
  // describe navigational properties here
}

export type MnsResultWithRelations = MnsResult & MnsResultRelations;
