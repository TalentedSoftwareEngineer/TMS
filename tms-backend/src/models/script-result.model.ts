import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {ScriptSql} from './script-sql.model';
import {User} from "./user.model";
import {ScriptProgress} from './script-progress.model';

@model({
  name: 'script_result'
})
export class ScriptResult extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4'
  })
  id?: string;

  @belongsTo(() => User, {name: 'user'})
  user_id: number;

  @belongsTo(() => ScriptSql, {name: 'sql'})
  sql_id: number;

  @property({
    type: 'string',
  })
  filename?: string;

  @property({
    type: 'string',
  })
  ro?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  is_template: boolean;

  @property({
    type: 'number',
    required: true,
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
  out_filename?: string;

  @property({
    type: 'string',
  })
  err_filename?: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'date',
  })
  uploaded_at?: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @hasOne(() => ScriptProgress, {keyTo: 'id'})
  scriptProgress: ScriptProgress;

  constructor(data?: Partial<ScriptResult>) {
    super(data);
  }
}

export interface ScriptResultRelations {
  // describe navigational properties here
}

export type ScriptResultWithRelations = ScriptResult & ScriptResultRelations;
