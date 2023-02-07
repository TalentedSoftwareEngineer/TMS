import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'tfnregistry_contact'
})
export class TfnRegistryContact extends Entity {
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
  user_id: number;

  @property({
    type: 'string',
    required: true,
  })
  ro: string;

  @property({
    type: 'string',
    required: true,
  })
  contact_name: string;

  @property({
    type: 'string',
    required: true,
  })
  contact_number: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;


  constructor(data?: Partial<TfnRegistryContact>) {
    super(data);
  }
}

export interface TfnRegistryContactRelations {
  // describe navigational properties here
}

export type TfnRegistryContactWithRelations = TfnRegistryContact & TfnRegistryContactRelations;
