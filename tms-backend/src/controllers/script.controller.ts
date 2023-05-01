// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {Count, CountSchema, FilterExcludingWhere, repository} from "@loopback/repository";
import {ScriptResultRepository, ScriptSqlRepository, ScriptUserRepository} from "../repositories";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from "@loopback/rest";
import {Company, ScriptResult, ScriptSql, ScriptUser} from "../models";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";
import {SUPER_ADMIN_ROLE} from "../constants/configurations";
import {SCRIPT_TYPE} from "../constants/number_adminstration";

@authenticate('jwt')
export class ScriptController {
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
  async User_create(
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
  async User_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['username','password'];
    let num_fields = undefined;
    let custom = undefined;
    return this.scriptUserRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
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
  async User_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string
  ): Promise<ScriptUser[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['username','password'];
    let num_fields = undefined;
    let custom = undefined;
    let include = [{relation: 'created'}, {relation: 'updated'}];
    return this.scriptUserRepository.find(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include));
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
  async User_findById(
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
  async User_updateById(
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
  async User_deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
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

  @post('/script-sqls', {
    description: "Create sql script",
    responses: {
      '200': {
        description: 'ScriptSql model instance',
        content: {'application/json': {schema: getModelSchemaRef(ScriptSql)}},
      }
    }
  })
  async SQL_create(
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

    if (scriptSql.content.includes(SCRIPT_TYPE.TMPL_DIALNBR)) {
      scriptSql.type = SCRIPT_TYPE.TMPL_DIALNBR
    }
    else if (scriptSql.content.includes(SCRIPT_TYPE.DIALNBR)) {
      if (scriptSql.content.includes(SCRIPT_TYPE.TFNREPT_DIALNBR))
        scriptSql.type = SCRIPT_TYPE.TFNREPT_DIALNBR
      else
        scriptSql.type = SCRIPT_TYPE.DIALNBR
    } else
      throw new HttpErrors.BadRequest(MESSAGES.INVALID_SQL_SCRIPT)

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
  async SQL_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('sqlType') sqlType: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['content'];
    let num_fields = undefined;
    let custom: any[] = [];
    if (sqlType!=undefined && sqlType!="") {
      custom.push({type: sqlType})
    }

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
  async SQL_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('sqlType') sqlType: string,
  ): Promise<ScriptSql[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['content'];
    let num_fields = undefined;
    let custom: any[] = [];
    if (sqlType!=undefined && sqlType!="") {
      custom.push({type: sqlType})
    }

    let include = [{relation: 'created'}, {relation: 'updated'}, {relation: 'user'}];
    return this.scriptSqlRepository.find(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include));
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
  async SQL_findById(
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
  async SQL_updateById(
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

    if (scriptSql.content.includes(SCRIPT_TYPE.TMPL_DIALNBR)) {
      scriptSql.type = SCRIPT_TYPE.TMPL_DIALNBR
    }
    else if (scriptSql.content.includes(SCRIPT_TYPE.DIALNBR)) {
      if (scriptSql.content.includes(SCRIPT_TYPE.TFNREPT_DIALNBR))
        scriptSql.type = SCRIPT_TYPE.TFNREPT_DIALNBR
      else
        scriptSql.type = SCRIPT_TYPE.DIALNBR
    } else
      throw new HttpErrors.BadRequest(MESSAGES.INVALID_SQL_SCRIPT)

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
  async SQL_deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.scriptResultRepository.deleteAll({sql_id: id})

    // const result = await this.scriptResultRepository.findOne({where: { sql_id: id }})
    // if (result)
    //   throw new HttpErrors.BadRequest("This Script have SQL script result. It cannot be deleted.")

    await this.scriptSqlRepository.deleteById(id);
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
  async Result_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
      @param.query.string('resultFilter') resultFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let tmpUserIdFilter = userIdFilter=='' ? undefined : userIdFilter;
    let tmpResultFilter = resultFilter=='' ? undefined : resultFilter;

    let fields = ["ro", 'message'];
    let num_fields = undefined;
    let custom: any[] = [{status: tmpResultFilter}];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({user_id: tmpUserIdFilter})

    return this.scriptResultRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
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
  async Result_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
      @param.query.string('resultFilter') resultFilter: string,
      @param.query.string('sqlType') sqlType: string
  ): Promise<ScriptResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let tmpUserIdFilter = userIdFilter=='' ? undefined : userIdFilter;
    let tmpResultFilter = resultFilter=='' ? undefined : resultFilter;

    // TODO - filter by SQL Script Type

    let fields = ["ro", 'message'];
    let num_fields = undefined;
    let custom: any[] = [{status: tmpResultFilter}];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({user_id: tmpUserIdFilter})

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      },
      {
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
      }
    ];

    return this.scriptResultRepository.find(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include));
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
  async Result_findById(
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
