import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {ScriptUser} from './script-user.model';

@model({
  name: 'script_sql'
})
export class ScriptSql extends Entity {
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
  content: string;

  @property({
    type: 'string',
  })
  type?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  autorun: boolean;

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

  @belongsTo(() => ScriptUser, {name: 'user'})
  user_id: number;

  constructor(data?: Partial<ScriptSql>) {
    super(data);
  }
}

export interface ScriptSqlRelations {
  // describe navigational properties here
}

export type ScriptSqlWithRelations = ScriptSql & ScriptSqlRelations;
