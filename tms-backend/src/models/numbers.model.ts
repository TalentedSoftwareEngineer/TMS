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
    required: true,
    defaultFn: 'uuidv4'
  })
  id: string;

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
