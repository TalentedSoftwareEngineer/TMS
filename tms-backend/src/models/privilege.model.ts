import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'privilege'
})
export class Privilege extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  is_admin: boolean;

  constructor(data?: Partial<Privilege>) {
    super(data);
  }
}

export interface PrivilegeRelations {
  // describe navigational properties here
}

export type PrivilegeWithRelations = Privilege & PrivilegeRelations;
