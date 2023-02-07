import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {NsrReq} from "./nsr-req.model";

@model({
  name: 'activity'
})
export class Activity extends Entity {
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
  page: string;

  @property({
    type: 'string',
    required: true,
  })
  operation: string;

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
  })
  resp_org?: string;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'string',
  })
  sub_dt_tm?: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @property({
    type: 'string',
  })
  req_id?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  constructor(data?: Partial<Activity>) {
    super(data);
  }
}

export interface ActivityRelations {
  // describe navigational properties here
}

export type ActivityWithRelations = Activity & ActivityRelations;
