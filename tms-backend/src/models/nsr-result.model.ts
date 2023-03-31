import {Entity, model, property, belongsTo} from '@loopback/repository';

@model({
  name: 'nsr_result'
})
export class NsrResult extends Entity {
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
  suggested_num?: string;

  @property({
    type: 'string',
  })
  status?: string;

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

  constructor(data?: Partial<NsrResult>) {
    super(data);
  }
}

export interface NsrResultRelations {
  // describe navigational properties here
}

export type NsrResultWithRelations = NsrResult & NsrResultRelations;
