// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {Count, CountSchema, repository} from "@loopback/repository";
import {MnsReqRepository, MnsResultRepository, MroReqRepository, MroResultRepository} from "../repositories";
import {inject, service} from "@loopback/core";
import {NumberService} from "../services";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, requestBody} from "@loopback/rest";
import {MNSRequest} from "../models/mns.request";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {MRORequest} from "../models/mro.request";
import DataUtils from "../utils/data";
import {MnqResult, MnsReq, MnsResult} from "../models";
import {MroReq} from "../models/mro-req.model";
import {MroResult} from "../models/mro-result.model";

@authenticate('jwt')
export class MroController {
  constructor(
      @repository(MroReqRepository)
      public mroReqRepository: MroReqRepository,
      @repository(MroResultRepository)
      public mroResultRepository: MroResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

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
  async change(
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
    if (!profile.permissions.includes(PERMISSIONS.MRO))
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
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MRO))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mroReqRepository.count(DataUtils.getWhere(value,  ['request_desc', 'ro_id', 'new_ro_id', 'sub_dt_tm', 'message', 'status'], 'num_list', undefined));
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
              items: getModelSchemaRef(MnsReq, {includeRelations: true}),
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
  ): Promise<MroReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MRO))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mroReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'request_desc', 'new_ro_id', 'ro_id', 'sub_dt_tm', 'message', 'status' ], 'num_list', undefined, include));
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
              items: getModelSchemaRef(MnqResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<MroResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MRO))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mroResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MRO/{id}', {
    description: 'Delete MRO request',
    responses: {
      '204': {
        description: 'Company DELETE success',
      }
    }
  })
  async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MRO))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mroReqRepository.deleteById(id);
  }

}
