// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {NumberService} from "../services";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, requestBody} from "@loopback/rest";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {TRQRequest} from "../models/trq.request";
import {Count, CountSchema, Filter, repository, Where} from "@loopback/repository";
import {NsrReq, NsrResult, TrqReq, TrqResult} from "../models";
import {NsrReqRepository, NsrResultRepository, TrqReqRepository, TrqResultRepository} from "../repositories";
import DataUtils from "../utils/data";

@authenticate('jwt')
export class TrqController {
  constructor(
      @repository(TrqReqRepository)
      public trqReqRepository: TrqReqRepository,
      @repository(TrqResultRepository)
      public trqResultRepository: TrqResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

    @patch('/TRQ/retrieve', {
        description: 'Retrieve Number',
        responses: {
            '200': {
                description: 'TRQ Result',
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
    async retrieve(
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
                        },
                        required: ["ro", "numList"]
                    },
                },
            },
        })
            req: TRQRequest,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<any> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        if (req.ro == "" || req.numList==null || req.numList.length==0)
            throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

        // POST: num/trq
        this.numberService.queryTroubleReferralNumber(req, profile)

        return { success: true }
    }

    @get('/TRQ/count', {
        description: 'Get count of all TRQ requests',
        responses: {
            '200': {
                description: 'TRQRequest model count',
                content: {'application/json': {schema: CountSchema}},
            }
        }
    })
    async count(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile, 
        @param.query.string('value') value: string,
    ): Promise<Count> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.trqReqRepository.count(DataUtils.getWhere(value,
            ['sub_dt_tm', 'ro_id', 'message', 'status', 'total', 'completed'], 'num_list', undefined));
    }

    @get('/TRQ/data', {
        description: 'Find TrqRequest by filter condition',
        responses: {
            '200': {
                description: 'Array of TRQReq model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(TrqReq, {includeRelations: true}),
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
    ): Promise<TrqReq[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        let include = [
            {
                relation: 'user',
                scope: {
                    fields: { username: true, email: true, first_name: true, last_name: true }
                }
            }
        ];

        return this.trqReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
            ['sub_dt_tm', 'ro_id', 'message', 'status', 'total', 'completed'], 'num_list', undefined, include));
    }

    @get('/TRQ/{id}', {
        description: 'Get array of TRQResult by ID',
        responses: {
            '200': {
                description: 'TRQResult model instance',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(TrqResult, {includeRelations: true}),
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
        if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.trqResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
    }

    @del('/TRQ/{id}', {
        description: 'Delete Trq request',
        responses: {
            '204': {
                description: 'Company DELETE success',
            }
        }
    })
    async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        await this.trqReqRepository.deleteById(id);
    }


}
