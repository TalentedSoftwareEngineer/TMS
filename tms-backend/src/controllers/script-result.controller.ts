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
import {ScriptResult} from '../models';
import {ScriptResultRepository} from '../repositories';
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import AuditionedUtils from "../utils/audition";
import {authenticate} from "@loopback/authentication";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";

@authenticate('jwt')
export class ScriptResultController {
    constructor(
        @repository(ScriptResultRepository)
        public scriptResultRepository: ScriptResultRepository,
    ) {
    }

    @get('/script-results/count', {
      description: 'Get count of all sql script result records',
      responses: {
        '200': {
          description: 'ScriptResult model count',
          content: {'application/json': {schema: CountSchema}},
        }
      }
    })
    async count(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.where(ScriptResult) where?: Where<ScriptResult>,
    ): Promise<Count> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.scriptResultRepository.count(where);
    }

    @get('/script-results', {
      description: 'Find sql script results',
      responses: {
        '200': {
          description: 'Array of ScriptResult model instances',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(ScriptResult, {includeRelations: true}),
              },
            },
          },
        }
      }
    })
    async find(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.filter(ScriptResult) filter?: Filter<ScriptResult>,
    ): Promise<ScriptResult[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD))
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
      })

      filter.include.push({
        relation: 'sql',
        scope: {
          fields: { content: true, autorun: true, created_at: true, updated_at: true, created_by: true, updated_by: true },
          include: [
            {
              relation: 'created',
              scope: {
                fields: { username: true, email: true, first_name: true, last_name: true }
              }
            },
            {
              relation: 'updated',
              scope: {
                fields: { username: true, email: true, first_name: true, last_name: true }
              }
            }
          ]
        }
      })

        return this.scriptResultRepository.find(filter);
    }

    @get('/script-results/{id}', {
      description: 'Get sql script result record by ID',
      responses: {
        '200': {
          description: 'ScriptResult model instance',
          content: {
            'application/json': {
              schema: getModelSchemaRef(ScriptResult, {includeRelations: true}),
            },
          },
        }
      }
    })
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.string('id') id: string,
        @param.filter(ScriptResult, {exclude: 'where'}) filter?: FilterExcludingWhere<ScriptResult>
    ): Promise<ScriptResult> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD))
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
        })

        filter.include.push({
            relation: 'sql',
            scope: {
                fields: { content: true, autorun: true, created_at: true, updated_at: true, created_by: true, updated_by: true },
            }
        })

        return this.scriptResultRepository.findById(id, filter);
    }
}
