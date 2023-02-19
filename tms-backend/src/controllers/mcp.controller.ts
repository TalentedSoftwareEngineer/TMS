// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {Count, CountSchema, repository} from "@loopback/repository";
import {McpReqRepository, McpResultRepository} from "../repositories";
import {inject, service} from "@loopback/core";
import {NumberService} from "../services";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, requestBody} from "@loopback/rest";
import {McpReq, MCPRequest, MndReq, MNDRequest, MndResult, MnqReq} from "../models";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";

@authenticate('jwt')
export class McpController {
  constructor(
      @repository(McpReqRepository)
      public mcpReqRepository: McpReqRepository,
      @repository(McpResultRepository)
      public mcpResultRepository: McpResultRepository,
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
  async convert(
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
    if (!profile.permissions.includes(PERMISSIONS.MCP))
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
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MCP))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mcpReqRepository.count(DataUtils.getWhere(value, ['request_desc', "ro_id", 'message', 'status', 'start_eff_dt_tm', 'template_name'], 'num_list', undefined));
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
              items: getModelSchemaRef(MndReq, {includeRelations: true}),
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
  ): Promise<McpReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MCP))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];
    return this.mcpReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ['request_desc', "ro_id", 'message', 'status', 'start_eff_dt_tm', 'template_name'], 'num_list', undefined, include));
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
              items: getModelSchemaRef(MndResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<MndResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MCP))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mcpResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MCP/{id}', {
    description: 'Delete MCP request',
    responses: {
      '204': {
        description: 'Company DELETE success',
      }
    }
  })
  async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MCP))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mcpReqRepository.deleteById(id);
  }

}
