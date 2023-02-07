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
    @param.where(ActivityResult) where?: Where<ActivityResult>,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TASK_TRACKING))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.activityResultRepository.count(where);
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
    @param.filter(ActivityResult) filter?: Filter<ActivityResult>,
  ): Promise<ActivityResult[]> {
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

    return this.activityResultRepository.find(filter);
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
