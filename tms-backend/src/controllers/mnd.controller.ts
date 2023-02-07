// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {NumberService} from "../services";
import {Count, CountSchema, Filter, repository, Where} from "@loopback/repository";
import {MndReqRepository, MndResultRepository, MnqReqRepository, MnqResultRepository} from "../repositories";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, requestBody} from "@loopback/rest";
import {MNQRequest} from "../models/mnq.request";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {MNDRequest} from "../models/mnd.request";
import {MndReq, MndResult, MnqReq, MnqResult} from "../models";
import {PageRequest} from "../models/page.request";

@authenticate('jwt')
export class MNDController {
  constructor(
      @repository(MndReqRepository)
      public mndReqRepository: MndReqRepository,
      @repository(MndResultRepository)
      public mndResultRepository: MndResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

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
        if (!profile.permissions.includes(PERMISSIONS.MND))
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
    async count(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                        },
                        required: []
                    },
                },
            },
        })
        req: PageRequest,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<Count> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.MND))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.mndReqRepository.count({});
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
    async find(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: "object",
                        properties: {
                        },
                        required: []
                    },
                },
            },
        })
            req: PageRequest,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<MnqReq[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.MND))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.mndReqRepository.find(req.getFilter([], undefined, undefined, [
            {
                relation: 'user',
                scope: {
                    fields: { username: true, email: true, first_name: true, last_name: true }
                }
            }
        ]));
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
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.string('id') id: string,
    ): Promise<MndResult[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.MND))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.mndResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
    }

    @del('/MND/{id}', {
        description: 'Delete MND request',
        responses: {
            '204': {
                description: 'Company DELETE success',
            }
        }
    })
    async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.MND))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        await this.mndReqRepository.deleteById(id);
    }

}
