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
import {ScriptSql} from '../models';
import {ScriptResultRepository, ScriptSqlRepository} from '../repositories';
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import AuditionedUtils from "../utils/audition";
import {authenticate} from "@loopback/authentication";
import DataUtils from '../utils/data';

@authenticate('jwt')
export class ScriptSqlController {
    constructor(
        @repository(ScriptSqlRepository)
        public scriptSqlRepository: ScriptSqlRepository,
        @repository(ScriptResultRepository)
        public scriptResultRepository: ScriptResultRepository,
    ) {
    }

    @post('/script-sqls', {
      description: "Create sql script",
      responses: {
        '200': {
          description: 'ScriptSql model instance',
          content: {'application/json': {schema: getModelSchemaRef(ScriptSql)}},
        }
      }
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ScriptSql, {
                        title: 'NewScriptSql',
                        exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at'],
                    }),
                },
            },
        })
            scriptSql: Omit<ScriptSql, 'id,created_at,created_by,updated_at,updated_by'>,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<ScriptSql> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        scriptSql.created_by = profile.user.id
        scriptSql.created_at = new Date().toISOString()
        scriptSql.updated_by = profile.user.id
        scriptSql.updated_at = new Date().toISOString()

        return this.scriptSqlRepository.create(scriptSql);
    }

    @get('/script-sqls/count', {
      description: "Get count of all sql scripts",
      responses: {
        '200': {
          description: 'ScriptSql model count',
          content: {'application/json': {schema: CountSchema}},
        }
      }
    })
    async count(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.string('value') value: string
    ): Promise<Count> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        let fields = ['content'];
        let num_fields = undefined;
        let custom = undefined;
        return this.scriptSqlRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
    }

    @get('/script-sqls', {
      description: "find sql scripts",
      responses: {
        '200': {
          description: 'Array of ScriptSql model instances',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: getModelSchemaRef(ScriptSql, {includeRelations: true}),
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
        @param.query.string('value') value: string
    ): Promise<ScriptSql[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        let fields = ['content'];
        let num_fields = undefined;
        let custom = undefined;
        let include = [{relation: 'created'}, {relation: 'updated'}, {relation: 'user'}];
        return this.scriptSqlRepository.find(AuditionedUtils.includeAuditionedFilter(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include)));
    }

    @get('/script-sqls/{id}', {
      description: "Get sql script by id",
      responses: {
        '200': {
          description: 'ScriptSql model instance',
          content: {
            'application/json': {
              schema: getModelSchemaRef(ScriptSql, {includeRelations: true}),
            },
          },
        }
      }
    })
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
        @param.filter(ScriptSql, {exclude: 'where'}) filter?: FilterExcludingWhere<ScriptSql>
    ): Promise<ScriptSql> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (!filter)
            filter = {}

        if (!filter.include)
            filter.include = []

        filter.include.push({
            relation: 'user',
            scope: {
                fields: { username: true, password: true }
            }
        })

        return this.scriptSqlRepository.findById(id, filter);
    }

    @patch('/script-sqls/{id}', {
      description: "update sql script by id",
      responses: {
        '204': {
          description: 'ScriptSql PATCH success',
        }
      }
    })
    async updateById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ScriptSql, {
                        title: 'NewScriptSql',
                        exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at'],
                    }),
                },
            },
        })
            scriptSql: Omit<ScriptSql, 'id,created_at,created_by,updated_at,updated_by'>,
    ): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        scriptSql.updated_by = profile.user.id
        scriptSql.updated_at = new Date().toISOString()

        await this.scriptSqlRepository.updateById(id, scriptSql);
    }

    @del('/script-sqls/{id}', {
      description: "Delete sql script by id",
      responses: {
        '204': {
          description: 'ScriptSql DELETE success',
        }
      }
    })
    async deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        const result = await this.scriptResultRepository.findOne({where: { sql_id: id }})
        if (result)
            throw new HttpErrors.BadRequest("This Script have SQL script result. It cannot be deleted.")

        await this.scriptSqlRepository.deleteById(id);
    }
}
