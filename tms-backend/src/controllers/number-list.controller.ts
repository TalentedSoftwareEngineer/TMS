// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {AnyObject, Count, CountSchema, repository} from "@loopback/repository";
import {NumbersRepository, ScriptResultRepository, ScriptSqlRepository} from "../repositories";
import {get, post, getModelSchemaRef, HttpErrors, param} from "@loopback/rest";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";
import {Activity, Numbers, ScriptResult, ScriptSql} from "../models";
import {SUPER_ADMIN_ROLE} from "../constants/configurations";
import {authenticate} from "@loopback/authentication";
import AuditionedUtils from "../utils/audition";
import {FtpService, NumberService} from "../services";
import {PROGRESSING_STATUS} from "../constants/number_adminstration";

@authenticate('jwt')
export class NumberListController {
  constructor(
      @repository(NumbersRepository)
      public numbersRepository: NumbersRepository,
      @repository(ScriptSqlRepository)
      public scriptSqlRepository: ScriptSqlRepository,
      @repository(ScriptResultRepository)
      public scriptResultRepository: ScriptResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

  @get('/number_list/count', {
    description: 'Get all count of numbers',
    responses: {
      '200': {
        description: 'Numbers model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('entityFilter') entityFilter: string,
      @param.query.string('respOrgFilter') respOrgFilter: string,
      @param.query.string('templateFilter') templateFilter: string,
      @param.query.string('statusFilter') statusFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [
      { entity: entityFilter=='' ? undefined : entityFilter },
      { resp_org: respOrgFilter=='' ? undefined : respOrgFilter },
      { template_name: templateFilter=='' ? undefined : templateFilter },
      { status: statusFilter=='' ? undefined : statusFilter },
    ];

    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })

    return this.numbersRepository.count(DataUtils.getWhere(value,
        ["entity",'num', 'resp_org', 'status', 'sub_dt_tm', 'template_name', 'eff_dt_tm'],
        'num', custom));
  }

  @get('/number_list', {
    description: 'find numbers',
    responses: {
      '200': {
        description: 'Array of Numbers model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Numbers, {includeRelations: true}),
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
      @param.query.string('entityFilter') entityFilter: string,
      @param.query.string('respOrgFilter') respOrgFilter: string,
      @param.query.string('templateFilter') templateFilter: string,
      @param.query.string('statusFilter') statusFilter: string,
  ): Promise<Numbers[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [
      { entity: entityFilter=='' ? undefined : entityFilter },
      { resp_org: respOrgFilter=='' ? undefined : respOrgFilter },
      { template_name: templateFilter=='' ? undefined : templateFilter },
      { status: statusFilter=='' ? undefined : statusFilter },
    ];

    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })

    return this.numbersRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ["entity", 'num', 'resp_org', 'status', 'sub_dt_tm', 'template_name', 'eff_dt_tm'],
        'num', custom));
  }

  @get('/number_list/resp_org', {
    description: 'Get Resp Org',
    responses: {
      '200': {
        description: 'Array of Resp Org',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: "object",
                properties: {
                  resp_org: {
                    type: "string"
                  }
                }
              },
            },
          },
        },
      }
    }
  })
  async resporg(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<AnyObject> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let sql: string = "select resp_org from numbers"
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      sql += " where user_id=" + profile.user.id + ""
    sql += " group by resp_org"

    return await this.numbersRepository.execute(sql)
  }

  @get('/number_list/entity', {
    description: 'Get Entity',
    responses: {
      '200': {
        description: 'Array of Entity',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: "object",
                properties: {
                  entity: {
                    type: "string"
                  }
                }
              },
            },
          },
        },
      }
    }
  })
  async entity(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<AnyObject> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let sql: string = "select entity from numbers"
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      sql += " where user_id=" + profile.user.id + ""
    sql += " group by entity"

    return await this.numbersRepository.execute(sql)
  }

  @get('/number_list/template', {
    description: 'Get Template',
    responses: {
      '200': {
        description: 'Array of Template',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: "object",
                properties: {
                  template_name: {
                    type: "string"
                  }
                }
              },
            },
          },
        },
      }
    }
  })
  async template(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<AnyObject> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let sql: string = "select template_name from numbers"
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      sql += " where user_id=" + profile.user.id + ""
    sql += " group by template_name"

    return await this.numbersRepository.execute(sql)
  }

  @get('/number_list/status', {
    description: 'Get Status',
    responses: {
      '200': {
        description: 'Array of Status',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: "object",
                properties: {
                  status: {
                    type: "string"
                  }
                }
              },
            },
          },
        },
      }
    }
  })
  async status(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<AnyObject> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let sql: string = "select status from numbers"
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      sql += " where user_id=" + profile.user.id + ""
    sql += " group by status"

    return await this.numbersRepository.execute(sql)
  }

  @get('/number_list/script_users', {
    description: 'Get Script Users',
    responses: {
      '200': {
        description: 'Array of Script User',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: "object",
                properties: {
                  username: {
                    type: "string"
                  }
                }
              },
            },
          },
        },
      }
    }
  })
  async script_users(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<AnyObject> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let sql: string = "select s.user_id, u.username from script_sql s left join script_user u on u.id=s.user_id"
    sql += " group by s.user_id"

    return await this.scriptSqlRepository.execute(sql)
  }

  @get('/number_list/script_count', {
    description: "Get count of all sql scripts",
    responses: {
      '200': {
        description: 'ScriptSql model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async script_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['content'];
    let num_fields = undefined;

    let custom: any[] = [];
    if (userIdFilter!="") {
      custom.push({user_id: userIdFilter})
    }

    return this.scriptSqlRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
  }

  @get('/number_list/script_sqls', {
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
  async script_sqls(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<ScriptSql[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['content'];
    let num_fields = undefined;
    let custom: any[] = [];

    if (userIdFilter!="") {
      custom.push({user_id: userIdFilter})
    }

    let include = [{relation: 'created'}, {relation: 'updated'}, {relation: 'user'}];

    return this.scriptSqlRepository.find(AuditionedUtils.includeAuditionedFilter(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include)));
  }

  @post('/number_list/script_submit', {
    description: "Submit SQL scripts",
    responses: {
      '200': {
        description: 'ScriptSql Submit Result',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async script_submit(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('ids') ids: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (ids==null || ids=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const id: string[] = JSON.parse(ids)
    if (id.length==0)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    let result: string[] = []
    for (let i=0; i<id.length; i++) {
      let sr = new ScriptResult()
      sr.user_id = profile.user.id!
      sr.sql_id = Number(id[i])
      sr.imported = 0
      sr.message = ""
      sr.status = PROGRESSING_STATUS.WAITING
      sr.created_at = new Date().toISOString()
      sr.updated_at = new Date().toISOString()

      sr = await this.scriptResultRepository.create(sr)

      const user = await this.scriptSqlRepository.getScriptUser(sr.sql_id)
      this.numberService.executeScript(sr, user, profile)

      result.push(sr.id)
    }

    return { success: true, result };
  }

  @post('/number_list/script_cancel', {
    description: "Cancel SQL scripts",
    responses: {
      '200': {
        description: 'ScriptSql Cancel Result',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
              }
            },
          },
        },
      }
    }
  })
  async script_cancel(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('ids') ids: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (ids==null || ids=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const id: string[] = JSON.parse(ids)
    if (id.length==0)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    let result: string[] = []
    for (let i=0; i<id.length; i++) {
      await this.scriptResultRepository.updateProgress(id[i], PROGRESSING_STATUS.CANCELED)
    }

    return { success: true };
  }
}
