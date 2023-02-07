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
import {Company, ScriptUser} from '../models';
import {ScriptResultRepository, ScriptSqlRepository, ScriptUserRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import AuditionedUtils from "../utils/audition";

@authenticate('jwt')
export class ScriptUserController {
  constructor(
    @repository(ScriptUserRepository)
    public scriptUserRepository : ScriptUserRepository,
    @repository(ScriptSqlRepository)
    public scriptSqlRepository : ScriptSqlRepository,
    @repository(ScriptResultRepository)
    public scriptResultRepository : ScriptResultRepository,
  ) {}

  @post('/script-users', {
    description: "Create sql script user",
    responses: {
      '200': {
        description: 'ScriptUser model instance',
        content: {'application/json': {schema: getModelSchemaRef(ScriptUser)}},
      }
    }
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ScriptUser, {
            title: 'NewScriptUser',
            exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at'],
          }),
        },
      },
    })
    scriptUser: Omit<ScriptUser, 'id,created_at,created_by,updated_at,updated_by'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<ScriptUser> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    scriptUser.created_by = profile.user.id
    scriptUser.created_at = new Date().toISOString()
    scriptUser.updated_by = profile.user.id
    scriptUser.updated_at = new Date().toISOString()

    return this.scriptUserRepository.create(scriptUser);
  }

  @get('/script-users/count', {
    description: 'Get count of all sql script user',
    responses: {
      '200': {
        description: 'ScriptUser model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.where(ScriptUser) where?: Where<ScriptUser>,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.scriptUserRepository.count(where);
  }

  @get('/script-users', {
    description: 'Find sql script users',
    responses: {
      '200': {
        description: 'Array of ScriptUser model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(ScriptUser, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.filter(ScriptUser) filter?: Filter<ScriptUser>,
  ): Promise<ScriptUser[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.scriptUserRepository.find(AuditionedUtils.includeAuditionedFilter(filter));
  }

  @get('/script-users/{id}', {
    description: 'Get sql script user by id',
    responses: {
      '200': {
        description: 'ScriptUser model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(ScriptUser, {includeRelations: true}),
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.number('id') id: number,
    @param.filter(ScriptUser, {exclude: 'where'}) filter?: FilterExcludingWhere<ScriptUser>
  ): Promise<ScriptUser> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.scriptUserRepository.findById(id, filter);
  }

  @patch('/script-users/{id}', {
    description: "Update sql script user by id",
    responses: {
      '204': {
        description: 'ScriptUser PATCH success',
      }
    }
  })
  async updateById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Company, {
            title: 'NewScriptUser',
            exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at'],
          }),
        },
      },
    })
    scriptUser: Omit<ScriptUser, 'id,created_at,created_by,updated_at,updated_by'>,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    scriptUser.updated_by = profile.user.id
    scriptUser.updated_at = new Date().toISOString()

    await this.scriptUserRepository.updateById(id, scriptUser);
  }

  @del('/script-users/{id}', {
    description: "delete sql script user by id",
    responses: {
      '204': {
        description: 'ScriptUser DELETE success',
      }
    }
  })
  async deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const sql = await this.scriptSqlRepository.findOne({where: { user_id: id }})
    if (sql)
      throw new HttpErrors.BadRequest("This account have SQL script. It cannot be deleted.")

    const result = await this.scriptResultRepository.findOne({where: { user_id: id }})
    if (result)
      throw new HttpErrors.BadRequest("This account have SQL script result. It cannot be deleted.")

    await this.scriptUserRepository.deleteById(id);
  }
}
