import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {RolePrivilege} from './role-privilege.model';
import {User} from './user.model';

@model({
  name: 'role'
})
export class Role extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  description?: string;
  @property({
    type: 'date',
  })
  created_at?: string;
  @property({
    type: 'date',
  })
  updated_at?: string;

  @hasMany(() => RolePrivilege, {keyTo: 'role_id'})
  rolePrivileges: RolePrivilege[];

  @belongsTo(() => User, {name: 'created'})
  created_by: number;

  @belongsTo(() => User, {name: 'updated'})
  updated_by: number;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;
