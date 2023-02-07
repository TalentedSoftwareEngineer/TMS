import {Entity, model, property, hasOne, belongsTo} from '@loopback/repository';
import {Privilege} from './privilege.model';

@model({
  name: 'role_privilege'
})
export class RolePrivilege extends Entity {
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
    required: true,
  })
  role_id: number;

  @property({
    type: 'number',
    required: true,
  })
  privilege_id: number;

  constructor(data?: Partial<RolePrivilege>) {
    super(data);
  }
}

export interface RolePrivilegeRelations {
  // describe navigational properties here
}

export type RolePrivilegeWithRelations = RolePrivilege & RolePrivilegeRelations;
