import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response, HttpErrors,
} from '@loopback/rest';
import {ActivityResult} from '../models';
import {ActivityResultRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import DataUtils from '../utils/data';

@authenticate('jwt')
export class ActivityResultController {
  constructor(
    @repository(ActivityResultRepository)
    public activityResultRepository : ActivityResultRepository,
  ) {}

  @get('/activity-result/count', {
    description: 'Get count of all task',
    responses: {
      '200': {
        description: 'Tasks model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TASK_TRACKING))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

      let tmpUserIdFilter = userIdFilter=='' ? undefined : userIdFilter;

      let fields = ['type','action','src_num','src_tmpl_name','email','src_eff_dt_tm','tgt_num','tgt_tmpl_name','tgt_eff_dt_tm','resp_org','status'];
      let num_fields = 'src_num, tgt_num';
      let custom = [{user_id: tmpUserIdFilter}];
    return this.activityResultRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
  }

  @get('/activity-result', {
    description: 'Find tasks',
    responses: {
      '200': {
        description: 'Array of Tasks model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ActivityResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string
  ): Promise<ActivityResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TASK_TRACKING))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let tmpUserIdFilter = userIdFilter=='' ? undefined : userIdFilter;

    let fields = ['type','action','src_num','src_tmpl_name','email','src_eff_dt_tm','tgt_num','tgt_tmpl_name','tgt_eff_dt_tm','resp_org','status'];
    let num_fields = 'src_num, tgt_num';
    let custom = [{user_id: tmpUserIdFilter}];
    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      },
      {
        relation: 'activity',
        scope: {
          fields: { page: true, operation: true }
        }
      }
    ];
    return this.activityResultRepository.find(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include));
  }

  @get('/activity-result/{id}', {
    description: 'Get task by id',
    responses: {
      '200': {
        description: 'Tasks model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ActivityResult, {includeRelations: true}),
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(ActivityResult, {exclude: 'where'}) filter?: FilterExcludingWhere<ActivityResult>
  ): Promise<ActivityResult> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TASK_TRACKING))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (!filter)
      filter = {}

    if (!filter.include)
      filter.include = []

    filter.include.push({
      relation: 'user',
      scope: {
        fields: { username: true, email: true, first_name: true, last_name: true }
      }
    });

    filter.include.push({
      relation: 'activity',
      scope: {
        fields: { page: true, operation: true }
      }
    });

    return this.activityResultRepository.findById(id, filter);
  }
}
