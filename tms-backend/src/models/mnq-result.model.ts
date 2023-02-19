import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'mnq_result'
})
export class MnqResult extends Entity {
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
  last_act_dt?: string;

  @property({
    type: 'string',
  })
  res_until_dt?: string;

  @property({
    type: 'string',
  })
  disc_until_dt?: string;

  @property({
    type: 'string',
  })
  eff_dt?: string;

  @property({
    type: 'string',
  })
  resp_org_id?: string;

  @property({
    type: 'string',
  })
  con_name?: string;

  @property({
    type: 'string',
  })
  con_phone?: string;

  @property({
    type: 'string',
  })
  short_notes?: string;

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


  constructor(data?: Partial<MnqResult>) {
    super(data);
  }
}

export interface MnqResultRelations {
  // describe navigational properties here
}

export type MnqResultWithRelations = MnqResult & MnqResultRelations;
