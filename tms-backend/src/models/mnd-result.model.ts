import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'mnd_result'
})
export class MndResult extends Entity {
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
  template_name?: string;

  @property({
    type: 'string',
  })
  eff_dt_tm?: string;

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

  constructor(data?: Partial<MndResult>) {
    super(data);
  }
}

export interface MndResultRelations {
  // describe navigational properties here
}

export type MndResultWithRelations = MndResult & MndResultRelations;
