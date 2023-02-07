import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'trq_req'
})
export class TrqReq extends Entity {
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
  completed: number;

  @property({
    type: 'number',
    default: 0,
  })
  failed: number;

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
  })
  sub_dt_tm?: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  constructor(data?: Partial<TrqReq>) {
    super(data);
  }
}

export interface TrqReqRelations {
  // describe navigational properties here
}

export type TrqReqWithRelations = TrqReq & TrqReqRelations;
