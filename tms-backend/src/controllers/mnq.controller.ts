// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from "@loopback/rest";
import {NSRRequest} from "../models/nsr.request";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {NQU_TYPE, NSR_SUBMIT_TYPE, NSR_TYPE, PROGRESSING_STATUS} from "../constants/number_adminstration";
import {MnqReq, MnqResult, NsrReq, NsrResult} from "../models";
import {authenticate} from "@loopback/authentication";
import {NQURequest} from "../models/nqu.request";
import {NumberService} from "../services";
import {MNQRequest} from "../models/mnq.request";
import {Count, CountSchema, Filter, repository, Where} from "@loopback/repository";
import {MnqReqRepository, MnqResultRepository, NsrReqRepository, NsrResultRepository} from "../repositories";

@authenticate('jwt')
export class MNQController {
  constructor(
      @repository(MnqReqRepository)
      public mnqReqRepository: MnqReqRepository,
      @repository(MnqResultRepository)
      public mnqResultRepository: MnqResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

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
  async query(
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
    if (!profile.permissions.includes(PERMISSIONS.MNQ))
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
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.where(MnqReq) where?: Where<MnqReq>,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNQ))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnqReqRepository.count(where);
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
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.filter(MnqReq) filter?: Filter<MnqReq>,
  ): Promise<MnqReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNQ))
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

    return this.mnqReqRepository.find(filter);
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
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
      // @param.filter(NSRResult, {exclude: 'where'}) filter?: FilterExcludingWhere<NSRResult>
  ): Promise<MnqResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNQ))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.mnqResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/MNQ/{id}', {
    description: 'Delete MNQ request',
    responses: {
      '204': {
        description: 'Company DELETE success',
      }
    }
  })
  async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.MNQ))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.mnqReqRepository.deleteById(id);
  }

}
