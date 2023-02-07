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
import {Privilege} from '../models';
import {PrivilegeRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";

@authenticate('jwt')
export class PrivilegeController {
  constructor(
    @repository(PrivilegeRepository)
    public privilegeRepository : PrivilegeRepository,
  ) {}

  @get('/privileges', {
    description: 'Get all privilieges',
    responses: {
      '200': {
        description: 'Array of Privilege model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Privilege, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.filter(Privilege) filter?: Filter<Privilege>,
  ): Promise<Privilege[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.privilegeRepository.find(filter);
  }

  @get('/privileges/{id}', {
    description: 'Get privilege',
    responses: {
      '200': {
        description: 'Privilege model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Privilege, {includeRelations: true}),
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    @param.filter(Privilege, {exclude: 'where'}) filter?: FilterExcludingWhere<Privilege>
  ): Promise<Privilege> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.privilegeRepository.findById(id, filter);
  }

}
