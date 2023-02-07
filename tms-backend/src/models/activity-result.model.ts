import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Activity} from './activity.model';

@model({
  name: 'activity_result'
})
export class ActivityResult extends Entity {
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
    type: 'string',
    required: true,
  })
  action: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  del_flag: boolean;

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
    type: 'boolean',
    required: true,
    default: false,
  })
  checked: boolean;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  is_now: boolean;

  @property({
    type: 'string',
  })
  src_eff_dt_tm?: string;

  @property({
    type: 'string',
  })
  src_num?: string;

  @property({
    type: 'string',
  })
  src_tmpl_name?: string;

  @property({
    type: 'string',
  })
  tgt_eff_dt_tm?: string;

  @property({
    type: 'string',
  })
  tgt_num?: string;

  @property({
    type: 'string',
  })
  tgt_tmpl_name?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  @belongsTo(() => Activity, {name: 'activity'})
  activity_id: string;

  constructor(data?: Partial<ActivityResult>) {
    super(data);
  }
}

export interface ActivityResultRelations {
  // describe navigational properties here
}

export type ActivityResultWithRelations = ActivityResult & ActivityResultRelations;
