import {Entity, model, property, belongsTo} from '@loopback/repository';

@model({
  name: 'mna_result'
})
export class MnaResult extends Entity {
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
  eff_dt_tm?: string;

  @property({
    type: 'string',
  })
  sub_dt_tm?: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  constructor(data?: Partial<MnaResult>) {
    super(data);
  }
}

export interface MnaResultRelations {
  // describe navigational properties here
}

export type MnaResultWithRelations = MnaResult & MnaResultRelations;
