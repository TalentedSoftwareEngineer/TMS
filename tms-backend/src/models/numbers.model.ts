import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'numbers'
})
export class Numbers extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4'
  })
  id?: string;

  @property({
    type: 'number',
    required: true,
  })
  user_id: number;

  @property({
    type: 'string',
  })
  entity?: string;

  @property({
    type: 'string',
  })
  resp_org?: string;

  @property({
    type: 'string',
    required: true,
  })
  num: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

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
    required: true,
  })
  sub_dt_tm: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @belongsTo(() => User, {name: 'created'})
  created_by: number;

  @belongsTo(() => User, {name: 'updated'})
  updated_by: number;

  constructor(data?: Partial<Numbers>) {
    super(data);
  }
}

export interface NumbersRelations {
  // describe navigational properties here
}

export type NumbersWithRelations = Numbers & NumbersRelations;
