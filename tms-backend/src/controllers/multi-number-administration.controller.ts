// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {Count, CountSchema, repository} from "@loopback/repository";
import {
  McpReqRepository,
  McpResultRepository,
  MnaReqRepository,
  MnaResultRepository,
  MndReqRepository,
  MndResultRepository,
  MnqReqRepository,
  MnqResultRepository,
  MnsReqRepository,
  MnsResultRepository,
  MroReqRepository, MroResultRepository, NarReqRepository, NarResultRepository
} from "../repositories";
import {inject, service} from "@loopback/core";
import {NumberService, TfnRegistryApiService} from "../services";
import {authenticate} from "@loopback/authentication";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, requestBody} from "@loopback/rest";
import {
  McpReq,
  MCPRequest,
  McpResult,
  MnaReq,
  MNARequest,
  MnaResult,
  MndReq,
  MNDRequest,
  MndResult,
  MnqReq,
  MNQRequest,
  MnqResult,
  MnsReq,
  MNSRequest,
  MnsResult,
  MroReq,
  MRORequest,
  MroResult,
  NarReq,
  NARRequest,
  NarResult,
  OcaResult
} from "../models";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {SUPER_ADMIN_ROLE} from "../constants/configurations";
import DataUtils from "../utils/data";
import {PROGRESSING_STATUS} from "../constants/number_adminstration";

@authenticate('jwt')
export class MultiNumberAdministrationController {
  constructor(
      @repository(McpReqRepository)
      public mcpReqRepository: McpReqRepository,
      @repository(McpResultRepository)
      public mcpResultRepository: McpResultRepository,
      @repository(MnaReqRepository)
      public mnaReqRepository: MnaReqRepository,
      @repository(MnaResultRepository)
      public mnaResultRepository: MnaResultRepository,
      @repository(MndReqRepository)
      public mndReqRepository: MndReqRepository,
      @repository(MndResultRepository)
      public mndResultRepository: MndResultRepository,
      @repository(MnqReqRepository)
      public mnqReqRepository: MnqReqRepository,
      @repository(MnqResultRepository)
      public mnqResultRepository: MnqResultRepository,
      @repository(MnsReqRepository)
      public mnsReqRepository: MnsReqRepository,
      @repository(MnsResultRepository)
      public mnsResultRepository: MnsResultRepository,
      @repository(MroReqRepository)
      public mroReqRepository: MroReqRepository,
      @repository(MroResultRepository)
      public mroResultRepository: MroResultRepository,
      @repository(NarReqRepository)
      public narReqRepository: NarReqRepository,
      @repository(NarResultRepository)
      public narResultRepository: NarResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

  @patch('/MCP/convert', {
    description: 'Convert to Pointer Record',
    responses: {
      '200': {
        description: 'Convert Result',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              }
            }
          }
        },
      }
    }
  })
  async MCP_convert(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                numList: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                templateName: {
                  type: "string"
                },
                requestDesc: {
                  type: "string"
                },
                startEffDtTm: {
                  type: "string",
                  example: "NOW | date/time"
                },
              },
              required: ["ro", "numList", "requestDesc", "templateName", "startEffDtTm"]
            },
          },
        },
      })
          req: MCPRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_CONVERSION_TO_POINTER_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.numList==null || req.numList.length==0 || req.requestDesc=="" || req.startEffDtTm=="" || req.templateName=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // put: num/automation, REQ_TYPE_MCP
    this.numberService.convertToPointerRecord(req, profile)

    return { success: true }
  }

  @get('/MCP/count', {
    description: 'Get count of all MCP requests',
    responses: {
      '200': {
        description: 'MCP Request model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async MCP_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_CONVERSION_TO_POINTER_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.mcpReqRepository.count(DataUtils.getWhere(value,
        ['request_desc',  'num_list', "ro_id", 'message', 'status', 'start_eff_dt_tm', 'template_name'], 'num_list', custom));
  }

  @get('/MCP/data', {
    description: 'Find MCP Request by filter condition',
    responses: {
      '200': {
        description: 'Array of MCP Request model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(McpReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MCP_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<McpReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_CONVERSION_TO_POINTER_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mcpReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ['request_desc', 'num_list', "ro_id", 'message', 'status', 'start_eff_dt_tm', 'template_name'], 'num_list', custom, include));
  }

  @get('/MCP/{id}', {
    description: 'Get array of MCP Result by ID',
    responses: {
      '200': {
        description: 'MCP Result model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(McpResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MCP_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<McpResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_CONVERSION_TO_POINTER_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mcpResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MCP/{id}', {
    description: 'Delete MCP request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async MCP_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_CONVERSION_TO_POINTER_RECORD))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mcpReqRepository.deleteById(id);
  }

  @get('/MNA/list', {
    description: 'Get Reserved Number list',
    responses: {
      '200': {
        description: 'Reserved Number',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: 'object'
              }
            }
          }
        },
      }
    }
  })
  async MNA_list(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('ro') ro: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESERVE_NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (ro=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // GET: num/rnl
    return this.numberService.retrieveReservedNumberList(ro, profile)
  }

  @patch('/MNA/activate', {
    description: 'Activate SOMOS Number',
    responses: {
      '200': {
        description: 'OCA Request ID',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                req_id: {
                  type: "string"
                }
              }
            }
          }
        },
      }
    }
  })
  async MNA_activate(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                numList: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                contactName: {
                  type: "string",
                },
                contactNumber: {
                  type: "string",
                },
                templateName: {
                  type: "string",
                },
                serviceOrder: {
                  type: "string",
                },
                numTermLine: {
                  type: "number",
                },
                effDtTm: {
                  type: "string",
                },
              },
              required: [ "ro", "templateName", "serviceOrder", "numTermLine", "effDtTm"]
            },
          },
        },
      })
          req: MNARequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESERVE_NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.numList == null || req.numList.length == 0)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.contactName == "" || req.contactNumber == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.templateName=="" || req.serviceOrder=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // POST: frn/mnp
    this.numberService.activate(req, profile)

    return { success: true }
  }

  @get('/MNA/count', {
    description: 'Get count of all MNA requests',
    responses: {
      '200': {
        description: 'MNA Request model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async MNA_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESERVE_NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.mnaReqRepository.count(DataUtils.getWhere(value,
        [ 'ro_id', 'num_list', 'message', 'status', 'sub_dt_tm', "template_name", "service_order", "eff_dt_tm"],
        'num_list', custom));
  }

  @get('/MNA/data', {
    description: 'Find MNA Request by filter condition',
    responses: {
      '200': {
        description: 'Array of MNA Req model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnaReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MNA_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<MnaReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESERVE_NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mnaReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'ro_id', 'num_list', 'message', 'status', 'sub_dt_tm', "template_name", "service_order", "eff_dt_tm"],
        'num_list', custom, include
    ));
  }

  @get('/MNA/{id}', {
    description: 'Get array of MNA Result by ID',
    responses: {
      '200': {
        description: 'MNA Result model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnaResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MNA_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<OcaResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESERVE_NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnaResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MNA/{id}', {
    description: 'Delete MNA request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async MNA_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESERVE_NUMBER_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mnaReqRepository.deleteById(id);
  }

  @patch('/MND/disconnect', {
    description: 'Disconnect Number',
    responses: {
      '200': {
        description: 'Disconnect Result',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              }
            }
          }
        },
      }
    }
  })
  async MND_disconnect(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                numList: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                requestDesc: {
                  type: "string"
                },
                startEffDtTm: {
                  type: "string",
                  example: "NOW | date/time"
                },
                endInterceptDt: {
                  type: "string"
                },
                referral: {
                  type: "string",
                  example: "Y | N"
                },
              },
              required: ["ro", "numList", "requestDesc", "startEffDtTm", "referral"]
            },
          },
        },
      })
          req: MNDRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_DISCONNECT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.numList==null || req.numList.length==0 || req.requestDesc=="" || req.startEffDtTm=="" || req.referral=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // put: num/automation, REQ_TYPE_MND
    this.numberService.disconnectNumber(req, profile)

    return { success: true }
  }

  @get('/MND/count', {
    description: 'Get count of all MND requests',
    responses: {
      '200': {
        description: 'MNDRequest model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async MND_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_DISCONNECT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.mndReqRepository.count(DataUtils.getWhere(value,
        ['request_desc','num_list', "ro_id", 'message', 'status', 'start_eff_dt_tm', 'end_intercept_dt'], 'num_list', custom));
  }

  @get('/MND/data', {
    description: 'Find MNDRequest by filter condition',
    responses: {
      '200': {
        description: 'Array of MNDRequest model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MndReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MND_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<MnqReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_DISCONNECT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mndReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ['request_desc', 'num_list', "ro_id", 'message', 'status', 'start_eff_dt_tm', 'end_intercept_dt'], 'num_list', custom, include));
  }

  @get('/MND/{id}', {
    description: 'Get array of MNDResult by ID',
    responses: {
      '200': {
        description: 'MNDResult model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MndResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MND_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<MndResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_DISCONNECT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mndResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MND/{id}', {
    description: 'Delete MND request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async MND_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_DISCONNECT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mndReqRepository.deleteById(id);
  }

  @patch('/MNQ/query', {
    description: 'query Number',
    responses: {
      '200': {
        description: 'Query Result',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              }
            }
          }
        },
      }
    }
  })
  async MNQ_query(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                numList: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                requestDesc: {
                  type: "string"
                }
              },
              required: ["ro", "numList", "requestDesc"]
            },
          },
        },
      })
          req: MNQRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.numList==null || req.numList.length==0 || req.requestDesc=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // put: num/automation, REQ_TYPE_MNQ
    this.numberService.queryMultipleNumberData(req, profile)

    return { success: true }
  }

  @get('/MNQ/count', {
    description: 'Get count of all MNQ requests',
    responses: {
      '200': {
        description: 'MNQRequest model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async MNQ_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.mnqReqRepository.count(DataUtils.getWhere(value,
        ['request_desc','num_list', 'ro_id', 'sub_dt_tm', 'message', 'status'], 'num_list', custom));
  }

  @get('/MNQ/data', {
    description: 'Find MNQRequest by filter condition',
    responses: {
      '200': {
        description: 'Array of MNQRequest model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnqReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MNQ_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<MnqReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mnqReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'request_desc','num_list', 'ro_id', 'sub_dt_tm', 'message', 'status' ], 'num_list', custom, include));
  }

  @get('/MNQ/{id}', {
    description: 'Get array of MNQResult by ID',
    responses: {
      '200': {
        description: 'MNQResult model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnqResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MNQ_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<MnqResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnqResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MNQ/{id}', {
    description: 'Delete MNQ request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async MNQ_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mnqReqRepository.deleteById(id);
  }

  @patch('/MNS/spare', {
    description: 'Spare Number',
    responses: {
      '200': {
        description: 'Update Result',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              }
            }
          }
        },
      }
    }
  })
  async MNS_spare(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                numList: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                requestDesc: {
                  type: "string"
                }
              },
              required: ["ro", "numList", "requestDesc"]
            },
          },
        },
      })
          req: MNSRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_SPARE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.numList==null || req.numList.length==0 || req.requestDesc=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // put: num/automation, REQ_TYPE_MSP
    this.numberService.spareMultipleNumber(req, profile)

    return { success: true }
  }

  @get('/MNS/count', {
    description: 'Get count of all MNS requests',
    responses: {
      '200': {
        description: 'MNSRequest model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async MNS_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_SPARE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.mnsReqRepository.count(DataUtils.getWhere(value,
        ['request_desc','num_list', 'ro_id', 'sub_dt_tm', 'message', 'status'], 'num_list', custom));
  }

  @get('/MNS/data', {
    description: 'Find MNSRequest by filter condition',
    responses: {
      '200': {
        description: 'Array of MNSRequest model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnsReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MNS_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<MnsReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_SPARE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mnsReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'request_desc','num_list', 'ro_id', 'sub_dt_tm', 'message', 'status' ], 'num_list', custom, include));
  }

  @get('/MNS/{id}', {
    description: 'Get array of MNSResult by ID',
    responses: {
      '200': {
        description: 'MNSResult model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MnsResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MNS_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<MnsResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_SPARE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnsResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MNS/{id}', {
    description: 'Delete MNS request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async MNS_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_SPARE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mnsReqRepository.deleteById(id);
  }

  @patch('/MRO/change', {
    description: 'Change Resp ORG',
    responses: {
      '200': {
        description: 'Update Result',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              }
            }
          }
        },
      }
    }
  })
  async MRO_change(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                new_ro: {
                  type: "string",
                },
                numList: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                requestDesc: {
                  type: "string"
                }
              },
              required: ["ro", "new_ro", "numList", "requestDesc"]
            },
          },
        },
      })
          req: MRORequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_RESP_ORG_CHANGE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.new_ro=="" || req.numList==null || req.numList.length==0 || req.requestDesc=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // put: num/automation, REQ_TYPE_MRO
    this.numberService.changeRespOrg(req, profile)

    return { success: true }
  }

  @get('/MRO/count', {
    description: 'Get count of all MRO requests',
    responses: {
      '200': {
        description: 'MRO Request model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async MRO_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_RESP_ORG_CHANGE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.mroReqRepository.count(DataUtils.getWhere(value,
        ['request_desc','num_list', 'ro_id', 'new_ro_id', 'sub_dt_tm', 'message', 'status'], 'num_list', custom));
  }

  @get('/MRO/data', {
    description: 'Find MRO Request by filter condition',
    responses: {
      '200': {
        description: 'Array of MRO Request model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MroReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MRO_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<MroReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_RESP_ORG_CHANGE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mroReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'request_desc','num_list', 'new_ro_id', 'ro_id', 'sub_dt_tm', 'message', 'status' ], 'num_list', custom, include));
  }

  @get('/MRO/{id}', {
    description: 'Get array of MRO Result by ID',
    responses: {
      '200': {
        description: 'MRO Result model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(MroResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async MRO_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<MroResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_RESP_ORG_CHANGE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mroResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MRO/{id}', {
    description: 'Delete MRO request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async MRO_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MULTI_DIAL_NUMBER_RESP_ORG_CHANGE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mroReqRepository.deleteById(id);
  }

  @patch('/NAR/submit', {
    description: 'Request for Auto Reserve',
    responses: {
      '200': {
        description: 'Request Result',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
              }
            }
          }
        },
      }
    }
  })
  async NAR_create(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                wildCardNum: {
                  type: "string"
                },
                startAt: {
                  type: "string"
                },
                endAt: {
                  type: "string"
                },
                maxRequest: {
                  type: "number"
                },
                afterMin: {
                  type: "number"
                },
                contactName: {
                  type: "string",
                },
                contactNumber: {
                  type: "string",
                },
              },
              required: ["ro", "wildCardNum", "startAt", "endAt", "maxRequest", "contactName", "contactNumber"]
            },
          },
        },
      })
          req: NARRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.wildCardNum=="" || req.startAt=="" || req.endAt=="" || req.contactName=="" || req.contactNumber=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    let nar_req: NarReq = new NarReq()
    nar_req.user_id = profile.user.id
    nar_req.ro_id = req.ro
    nar_req.wild_card_num = req.wildCardNum
    nar_req.start_at = req.startAt
    nar_req.end_at = req.endAt
    nar_req.max_request = req.maxRequest
    nar_req.after_min = req.afterMin
    nar_req.sub_dt_tm = new Date().toISOString()
    nar_req.status = PROGRESSING_STATUS.PENDING
    nar_req.contact_number = req.contactNumber
    nar_req.contact_name = req.contactName
    nar_req.updated_at = new Date().toISOString()

    return this.narReqRepository.create(nar_req)
  }

  @get('/NAR/count', {
    description: 'Get count of all NAR requests',
    responses: {
      '200': {
        description: 'NAR Request model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async NAR_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.narReqRepository.count(DataUtils.getWhere(value,
        [ 'ro_id', 'message',  'wild_card_num', "start_at", 'end_at', 'status', 'sub_dt_tm'],
        'wild_card_num', custom));
  }

  @get('/NAR/data', {
    description: 'Find NAR Request by filter condition',
    responses: {
      '200': {
        description: 'Array of NAR Req model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(NarReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async NAR_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<NarReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.narReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ['ro_id', 'message',  'wild_card_num', "start_at", 'end_at', 'status', 'sub_dt_tm'],
        'wild_card_num', custom, include
    ));
  }

  @get('/NAR/{id}', {
    description: 'Get array of NAR Result by ID',
    responses: {
      '200': {
        description: 'NAR Result model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(NarResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async NAR_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<NarResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.narResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @patch('/NAR/{id}', {
    description: 'Cancel NAR request',
    responses: {
      '204': {
        description: 'CANCEL success',
      }
    }
  })
  async NAR_cancelById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const req = await this.narReqRepository.findById(id)
    req.status = PROGRESSING_STATUS.CANCELED
    req.updated_at = new Date().toISOString()

    await this.narReqRepository.save(req)
  }

  @del('/NAR/{id}', {
    description: 'Delete NAR request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async NAR_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.AUTO_RESERVE_NUMBERS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.narReqRepository.deleteById(id);
  }
}
