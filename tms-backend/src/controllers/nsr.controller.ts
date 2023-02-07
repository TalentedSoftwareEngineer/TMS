// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {del, get, getModelSchemaRef, HttpErrors, param, post, requestBody} from "@loopback/rest";
import {Company, NsrReq, NsrResult} from "../models";
import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {NumberService, TfnRegistryApiService} from "../services";
import DataUtils from "../utils/data";
import {NSR_SUBMIT_TYPE, NSR_TYPE, PROGRESSING_STATUS} from "../constants/number_adminstration";
import {NSRRequest} from "../models/nsr.request";
import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from "@loopback/repository";
import {NsrReqRepository, NsrResultRepository} from "../repositories";

@authenticate('jwt')
export class NSRController {
  constructor(
      @repository(NsrReqRepository)
      public nsrReqRepository: NsrReqRepository,
      @repository(NsrResultRepository)
      public nsrResultRepository: NsrResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

  @post('/NSR/SearchAndReserve', {
    description: 'Search and Reserve SOMOS Number',
    responses: {
      '200': {
        description: 'NSRRequest ID',
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
  async searchAndReserve(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                type: {
                  type: "string",
                  examples: ["RANDOM", "WILDCARD", "SPECIFIC"]
                },
                submitType: {
                  type: "string",
                  examples: ["SEARCH", "SEARCH & RESERVE"]
                },
                qty: {
                  type: "integer",
                },
                cons: {
                  type: "string",
                  examples: ["Y", "N"]
                },
                npa: {
                  type: "string",
                },
                nxx: {
                  type: "string",
                },
                line: {
                  type: "string",
                },
                wildCardNum: {
                  type: "string",
                },
                specificNums: {
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
              },
              required: ["type", "submitType", "qty", "cons", "ro"]
            },
          },
        },
      })
          req: NSRRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || ![NSR_TYPE.RANDOM, NSR_TYPE.WILDCARD, NSR_TYPE.SPECIFIC].includes(req.type) ||
        ![NSR_SUBMIT_TYPE.SEARCH, NSR_SUBMIT_TYPE.SEARCH_RESERVE].includes(req.submitType)
    )
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.type != NSR_TYPE.SPECIFIC && req.qty == 0)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.type == NSR_TYPE.WILDCARD && req.wildCardNum == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.type == NSR_TYPE.SPECIFIC && (req.specificNums == null || req.specificNums?.length == 0))
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.submitType == NSR_SUBMIT_TYPE.SEARCH_RESERVE && (req.contactName == "" || req.contactNumber == ""))
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // POST: num/nus
    this.numberService.searchAndReserve(req, profile)

    return { success: true }
  }

  @get('/NSR/count', {
    description: 'Get count of all NSR requests',
    responses: {
      '200': {
        description: 'NSRRequest model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.where(NsrReq) where?: Where<NsrReq>,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.nsrReqRepository.count(where);
  }

  @get('/NSR/data', {
    description: 'Find NSRRequest by filter condition',
    responses: {
      '200': {
        description: 'Array of NSRReq model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(NsrReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.filter(NsrReq) filter?: Filter<NsrReq>,
  ): Promise<NsrReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
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

    return this.nsrReqRepository.find(filter);
  }

  @get('/NSR/{id}', {
    description: 'Get array of NSRResult by ID',
    responses: {
      '200': {
        description: 'NSRResult model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(NsrResult, {includeRelations: true}),
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
  ): Promise<NsrResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.nsrResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/NSR/{id}', {
    description: 'Delete NSR request',
    responses: {
      '204': {
        description: 'Company DELETE success',
      }
    }
  })
  async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.nsrReqRepository.deleteById(id);
  }

}
