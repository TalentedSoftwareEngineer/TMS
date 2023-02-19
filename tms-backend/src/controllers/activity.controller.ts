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
import {Activity} from '../models';
import {ActivityRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import DataUtils from '../utils/data';

@authenticate('jwt')
export class ActivityController {
  constructor(
    @repository(ActivityRepository)
    public activityRepository : ActivityRepository,
  ) {}

  @get('/activities/count', {
    description: 'Get all count of activity records',
    responses: {
      '200': {
        description: 'Activity model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
      @param.query.string('statusFilter') statusFilter: string
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.USER_ACTIVITY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let tmpUserFilterId = userIdFilter=='' ? undefined : userIdFilter;
    let tmpStatusFilter = statusFilter=='' ? undefined : statusFilter;

    let fields = ['operation','sub_dt_tm','message'];
    let num_fields = undefined;
    let custom = [{user_id: tmpUserFilterId}, {status: tmpStatusFilter}];
    return this.activityRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
  }

  @get('/activities', {
    description: 'find activities',
    responses: {
      '200': {
        description: 'Array of Activity model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Activity, {includeRelations: true}),
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
      @param.query.string('userIdFilter') userIdFilter: string,
      @param.query.string('statusFilter') statusFilter: string
  ): Promise<Activity[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.USER_ACTIVITY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let tmpUserFilterId = userIdFilter=='' ? undefined : userIdFilter;
    let tmpStatusFilter = statusFilter=='' ? undefined : statusFilter;

    let fields = ['operation','sub_dt_tm','message'];
    let num_fields = undefined;
    let custom = [{user_id: tmpUserFilterId}, {status: tmpStatusFilter}];
    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];
    return this.activityRepository.find(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include));
  }

  @get('/activities/{id}', {
    description: 'Get activity by ID',
    responses: {
      '200': {
        description: 'Activity model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Activity, {includeRelations: true}),
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(Activity, {exclude: 'where'}) filter?: FilterExcludingWhere<Activity>
  ): Promise<Activity> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.USER_ACTIVITY))
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

    return this.activityRepository.findById(id, filter);
  }

}
