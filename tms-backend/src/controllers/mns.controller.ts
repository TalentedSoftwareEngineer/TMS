// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {del, get, getModelSchemaRef, HttpErrors, param, patch, requestBody} from "@loopback/rest";
import {MNQRequest} from "../models/mnq.request";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {NumberService} from "../services";
import {Count, CountSchema, repository} from "@loopback/repository";
import {MnsReqRepository, MnsResultRepository} from "../repositories";
import {MNSRequest} from "../models/mns.request";
import DataUtils from "../utils/data";
import {MnqReq, MnqResult, MnsReq, MnsResult} from "../models";
import {authenticate} from "@loopback/authentication";

@authenticate('jwt')
export class MnsController {
  constructor(
      @repository(MnsReqRepository)
      public mnsReqRepository: MnsReqRepository,
      @repository(MnsResultRepository)
      public mnsResultRepository: MnsResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

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
  async spare(
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
    if (!profile.permissions.includes(PERMISSIONS.MNS))
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
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnsReqRepository.count(DataUtils.getWhere(value,  ['request_desc', 'ro_id', 'sub_dt_tm', 'message', 'status'], 'num_list', undefined));
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
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
  ): Promise<MnsReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNQ))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let include = [
      {
        relation: 'user',
        scope: {
          fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];

    return this.mnsReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'request_desc', 'ro_id', 'sub_dt_tm', 'message', 'status' ], 'num_list', undefined, include));
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
  ): Promise<MnsResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnsResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MNS/{id}', {
    description: 'Delete MNS request',
    responses: {
      '204': {
        description: 'Company DELETE success',
      }
    }
  })
  async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNS))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mnsReqRepository.deleteById(id);
  }

}
