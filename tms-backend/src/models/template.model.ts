import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model({
  name: 'templates'
})
export class Template extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  resp_org?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  eff_dt_tm?: string;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'string',
  })
  approval?: string;

  @property({
    type: 'string',
  })
  component?: string;

  @property({
    type: 'string',
  })
  rec_version_id?: string;

  @property({
    type: 'string',
  })
  tmpl_id?: string;

  @property({
    type: 'string',
  })
  tmpl_desc?: string;

  @property({
    type: 'string',
  })
  tmpl_rec_stat?: string;

  @property({
    type: 'string',
  })
  lst_eff_dt_tms?: string;

  @property({
    type: 'string',
  })
  req_eff_dt_tm?: string;

  @property({
    type: 'string',
  })
  req_tmpl_rec_stat?: string;

  @property({
    type: 'string',
  })
  priority?: string;

  @property({
    type: 'string',
  })
  perms?: string;

  @property({
    type: 'string',
  })
  prev_usr?: string;

  @property({
    type: 'string',
  })
  last_up_dt?: string;

  @property({
    type: 'string',
  })
  last_usr?: string;

  @property({
    type: 'string',
  })
  con_name?: string;

  @property({
    type: 'string',
  })
  con_tel?: string;

  @property({
    type: 'string',
  })
  notes?: string;

  @property({
    type: 'string',
  })
  inter_lata_carrier?: string;

  @property({
    type: 'string',
  })
  intra_lata_carrier?: string;

  @property({
    type: 'string',
  })
  aos?: string;

  @property({
    type: 'number',
  })
  num_term_line?: number;

  @property({
    type: 'string',
  })
  cpr_sect_name?: string;

  @property({
    type: 'string',
  })
  day_light_savings?: string;

  @property({
    type: 'string',
  })
  pri_inter_lt?: string;

  @property({
    type: 'string',
  })
  pri_intra_lt?: string;

  @property({
    type: 'string',
  })
  tm_zn?: string;

  @property({
    type: 'string',
  })
  lbl?: string;

  @property({
    type: 'date',
  })
  created_at?: string;

  @property({
    type: 'date',
  })
  updated_at?: string;

  @belongsTo(() => User, {name: 'created'})
  created_by: number;

  @belongsTo(() => User, {name: 'updated'})
  updated_by: number;

  constructor(data?: Partial<Template>) {
    super(data);
  }
}

export interface TemplateRelations {
  // describe navigational properties here
}

export type TemplateWithRelations = Template & TemplateRelations;
