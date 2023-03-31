import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'mna_req'
})
export class MnaReq extends Entity {
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
  num_list: string;

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
    type: 'boolean',
    required: true,
    default: false,
  })
  del_flag: boolean;

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

  constructor(data?: Partial<MnaReq>) {
    super(data);
  }
}

export interface MnaReqRelations {
  // describe navigational properties here
}

export type MnaReqWithRelations = MnaReq & MnaReqRelations;
