import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'user_info'
})
export class UserInfo extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id?: number;

  @property({
    type: 'string',
  })
  country?: string;

  @property({
    type: 'string',
  })
  address?: string;

  @property({
    type: 'string',
  })
  province?: string;

  @property({
    type: 'string',
  })
  city?: string;

  @property({
    type: 'string',
  })
  zip_code?: string;

  @property({
    type: 'string',
  })
  tel1?: string;

  @property({
    type: 'string',
  })
  tel2?: string;

  @property({
    type: 'string',
  })
  mobile?: string;

  @property({
    type: 'string',
  })
  fax?: string;

  @property({
    type: 'string',
  })
  contact_name?: string;

  @property({
    type: 'string',
  })
  contact_number?: string;
  @property({
    type: 'date',
  })
  created_at?: string;
  @property({
    type: 'date',
  })
  updated_at?: string;

  @property({
    type: 'number',
  })
  created_by?: number;

  @property({
    type: 'number',
  })
  updated_by?: number;

  constructor(data?: Partial<UserInfo>) {
    super(data);
  }
}

export interface UserInfoRelations {
  // describe navigational properties here
}

export type UserUserInfoWithRelations = UserInfo & UserInfoRelations;
