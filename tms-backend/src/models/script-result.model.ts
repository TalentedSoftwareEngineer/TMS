import {Entity, model, property, belongsTo} from '@loopback/repository';
import {ScriptSql} from './script-sql.model';
import {User} from "./user.model";

@model({
  name: 'script_result'
})
export class ScriptResult extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    defaultFn: 'uuidv4'
  })
  id: string;

  @property({
    type: 'number',
    default: 0,
  })
  imported: number;

  @property({
    type: 'string',
  })
  message?: string;

  @property({
    type: 'string',
  })
  result?: string;

  @property({
    type: 'date',
  })
  executed_at?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  @belongsTo(() => ScriptSql, {name: 'sql'})
  sql_id: number;

  constructor(data?: Partial<ScriptResult>) {
    super(data);
  }
}

export interface ScriptResultRelations {
  // describe navigational properties here
}

export type ScriptResultWithRelations = ScriptResult & ScriptResultRelations;
