import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'nar_req'
})
export class NarReq extends Entity {
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
  ro_id: string;

  @property({
    type: 'string',
    required: true,
  })
  wild_card_num: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  max_request: number;

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
    type: 'boolean',
    required: true,
    default: false,
  })
  del_flag: boolean;

  @property({
    type: 'string',
    required: true,
  })
  start_at: string;

  @property({
    type: 'string',
    required: true,
  })
  end_at: string;

  @property({
    type: 'number',
  })
  after_min?: number;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
  })
  sub_dt_tm?: string;

  @property({
    type: 'string',
    required: true,
  })
  contact_name: string;

  @property({
    type: 'string',
    required: true,
  })
  contact_number: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  constructor(data?: Partial<NarReq>) {
    super(data);
  }
}

export interface NarReqRelations {
  // describe navigational properties here
}

export type NarReqWithRelations = NarReq & NarReqRelations;
