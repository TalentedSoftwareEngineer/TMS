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
    type: 'number',
  })
  rec_version_id?: number;

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


  constructor(data?: Partial<MnsResult>) {
    super(data);
  }
}

export interface MnsResultRelations {
  // describe navigational properties here
}

export type MnsResultWithRelations = MnsResult & MnsResultRelations;
