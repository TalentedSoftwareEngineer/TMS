import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'news_event'
})
export class NewsEvent extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
    defaultFn: 'uuidv4'
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  content: string;

  @property({
    type: 'number',
  })
  created_by?: number;

  @property({
    type: 'date',
  })
  created_at?: string;


  constructor(data?: Partial<NewsEvent>) {
    super(data);
  }
}

export interface NewsEventRelations {
  // describe navigational properties here
}

export type NewsEventWithRelations = NewsEvent & NewsEventRelations;
