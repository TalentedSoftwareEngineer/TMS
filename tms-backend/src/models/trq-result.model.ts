import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'trq_result'
})
export class TrqResult extends Entity {
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
  resp_org_id?: string;

  @property({
    type: 'string',
  })
  resp_org_name?: string;

  @property({
    type: 'string',
  })
  ref_num?: string;

  @property({
    type: 'string',
  })
  status: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;


  constructor(data?: Partial<TrqResult>) {
    super(data);
  }
}

export interface TrqResultRelations {
  // describe navigational properties here
}

export type TrqResultWithRelations = TrqResult & TrqResultRelations;
