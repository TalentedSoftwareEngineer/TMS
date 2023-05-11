import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Company} from './company.model';
import {UserCredentials} from './user-credentials.model';
import {SomosUser} from './somos-user.model';
import {UserInfo} from "./user-info.model";
import {Role} from './role.model';
import {UserCreateRequest} from "./user.create";

@model({
  name: 'user'
})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    index: {
      unique: true,
    },
  })
  username: string;
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  first_name: string;

  @property({
    type: 'string',
    required: true,
  })
  last_name: string;

  @property({
    type: 'string',
  })
  ro?: string;

  @property({
    type: 'number',
  })
  timezone?: string;

  @property({
    type: 'boolean',
    required: true,
    default: false
  })
  status: boolean;

  @property({
    type: 'string',
  })
  ui_settings?: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'number',
  })
  created_by?: number;

  @property({
    type: 'number',
  })
  updated_by?: number;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @hasOne(() => UserCredentials, {keyTo: 'id'})
  userCredentials: UserCredentials;

  @hasOne(() => UserInfo, {keyTo: 'id'})
  userInfo: UserInfo;

  @belongsTo(() => Company, {name: 'company'})
  company_id: number;

  @belongsTo(() => SomosUser, {name: 'somosUser'})
  somos_id: number;

  @belongsTo(() => Role, {name: 'role'})
  role_id: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
