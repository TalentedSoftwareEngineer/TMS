import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'script_progress'
})
export class ScriptProgress extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;


  constructor(data?: Partial<ScriptProgress>) {
    super(data);
  }
}

export interface ScriptProgressRelations {
  // describe navigational properties here
}

export type ScriptProgressWithRelations = ScriptProgress & ScriptProgressRelations;
