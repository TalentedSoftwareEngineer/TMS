import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'script_user'
})
export class ScriptUser extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

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

  constructor(data?: Partial<ScriptUser>) {
    super(data);
  }
}

export interface ScriptUserRelations {
  // describe navigational properties here
}

export type ScriptUserWithRelations = ScriptUser & ScriptUserRelations;
