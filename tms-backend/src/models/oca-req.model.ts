import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'oca_req'
})
export class OcaReq extends Entity {
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
  type: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  total: number;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  failed: number;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  completed: number;

  @property({
    type: 'string',
    required: true,
  })
  ro_id: string;

  @property({
    type: 'string',
  })
  consecutive?: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  del_flag: boolean;

  @property({
    type: 'string',
  })
  npa?: string;

  @property({
    type: 'string',
  })
  nxx?: string;

  @property({
    type: 'string',
  })
  line?: string;

  @property({
    type: 'string',
  })
  wild_card_num?: string;

  @property({
    type: 'string',
  })
  specific_num?: string;

  @property({
    type: 'string',
    required: true,
  })
  template_name: string;

  @property({
    type: 'string',
    required: true,
  })
  service_order: string;

  @property({
    type: 'number',
    required: true,
  })
  num_term_line: number;

  @property({
    type: 'string',
    required: true,
  })
  eff_dt_tm: string;

  @property({
    type: 'string',
  })
  timezone?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
  })
  sub_dt_tm?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  constructor(data?: Partial<OcaReq>) {
    super(data);
  }
}

export interface OcaReqRelations {
  // describe navigational properties here
}

export type OcaReqWithRelations = OcaReq & OcaReqRelations;
