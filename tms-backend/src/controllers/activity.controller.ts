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
    @param.where(Activity) where?: Where<Activity>,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.USER_ACTIVITY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.activityRepository.count(where);
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
    @param.filter(Activity) filter?: Filter<Activity>,
  ): Promise<Activity[]> {
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

    return this.activityRepository.find(filter);
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
