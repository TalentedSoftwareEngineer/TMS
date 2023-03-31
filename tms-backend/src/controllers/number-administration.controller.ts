// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {NumberService, TfnRegistryApiService} from "../services";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from "@loopback/rest";
import {
  NQURequest,
  NsrReq,
  NSRRequest,
  NsrResult,
  OcaReq,
  OCARequest,
  OcaResult,
  TrqReq,
  TRQRequest,
  TrqResult
} from "../models";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {Count, CountSchema, repository} from "@loopback/repository";
import {
  NsrReqRepository,
  NsrResultRepository,
  OcaReqRepository,
  OcaResultRepository,
  TrqReqRepository, TrqResultRepository
} from "../repositories";
import {NSR_SUBMIT_TYPE, NSR_TYPE} from "../constants/number_adminstration";
import {SUPER_ADMIN_ROLE} from "../constants/configurations";
import DataUtils from "../utils/data";

@authenticate('jwt')
export class NumberAdministrationController {
  constructor(
      @repository(NsrReqRepository)
      public nsrReqRepository: NsrReqRepository,
      @repository(NsrResultRepository)
      public nsrResultRepository: NsrResultRepository,
      @repository(OcaReqRepository)
      public ocaReqRepository: OcaReqRepository,
      @repository(OcaResultRepository)
      public ocaResultRepository: OcaResultRepository,
      @repository(TrqReqRepository)
      public trqReqRepository: TrqReqRepository,
      @repository(TrqResultRepository)
      public trqResultRepository: TrqResultRepository,
      @service(NumberService)
      public numberService: NumberService,
  ) {}

  @patch('/NQU/query', {
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
  async NQU_query(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                num: {
                  type: "string",
                },
              },
              required: ["ro", "num"]
            },
          },
        },
      })
          req: NQURequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.num == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // PUT: num/tfn/query
    return this.numberService.numberQuery(req, profile)
  }

  @patch('/NQU/update', {
    description: 'Update Number',
    responses: {
      '200': {
        description: 'Query Update Result',
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
  async NQU_update(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                num: {
                  type: "string"
                },
                status: {
                  type: "string"
                },
                contactName: {
                  type: "string",
                },
                contactNumber: {
                  type: "string",
                },
                shortNotes: {
                  type: "string",
                },
                recVersionId: {
                  type: "string",
                },
              },
              required: ["ro", "num", "recVersionId", "contactName", "contactNumber"]
            },
          },
        },
      })
          req: NQURequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.num == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // PUT: num/tfn/update
    return this.numberService.numberUpdate(req, profile)
  }

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
  async NSR_searchAndReserve(
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
  async NSR_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.nsrReqRepository.count(DataUtils.getWhere(value,
        ['submit_type', 'type', 'ro_id', 'message', 'npa', 'nxx', 'line', 'specific_num', 'wild_card_num', 'status', 'sub_dt_tm'],
        'npa,nxx,line,specific_num', custom));
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
  async NSR_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<NsrReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
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

    return this.nsrReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ['submit_type', 'type', 'ro_id', 'message', 'npa', 'nxx', 'line', 'specific_num', 'wild_card_num', 'status', 'sub_dt_tm'],
        'npa,nxx,line,specific_num', custom, include
    ));
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
  async NSR_findById(
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
        description: 'DELETE success',
      }
    }
  })
  async NSR_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.SEARCH_NUMBER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.nsrReqRepository.deleteById(id);
  }

  @patch('/OCA/activate', {
    description: 'Search and Reserve, Activate SOMOS Number',
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
  async OCA_activate(
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
                timezone: {
                  type: "string",
                },
              },
              required: ["type", "qty", "cons", "ro", "templateName", "serviceOrder", "numTermLine", "effDtTm"]
            },
          },
        },
      })
          req: OCARequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ONE_CLICK_ACTIVATE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || ![NSR_TYPE.RANDOM, NSR_TYPE.WILDCARD, NSR_TYPE.SPECIFIC].includes(req.type))
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.type != NSR_TYPE.SPECIFIC && req.qty == 0)
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.type == NSR_TYPE.WILDCARD && req.wildCardNum == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.type == NSR_TYPE.SPECIFIC && (req.specificNums == null || req.specificNums?.length == 0))
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.contactName == "" || req.contactNumber == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    if (req.templateName=="" || req.serviceOrder=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // POST: num/oca
    this.numberService.oneClickActivate(req, profile)

    return { success: true }
  }

  @get('/OCA/count', {
    description: 'Get count of all OCA requests',
    responses: {
      '200': {
        description: 'OCA Request model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async OCA_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ONE_CLICK_ACTIVATE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.ocaReqRepository.count(DataUtils.getWhere(value,
        [ 'type', 'ro_id', 'message', 'npa', 'nxx', 'line', 'wild_card_num','specific_num', 'status', 'sub_dt_tm', "template_name", "service_order", "eff_dt_tm"],
        'npa,nxx,line,specific_num', custom));
  }

  @get('/OCA/data', {
    description: 'Find OCA Request by filter condition',
    responses: {
      '200': {
        description: 'Array of OCA Req model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(OcaReq, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async OCA_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<OcaReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ONE_CLICK_ACTIVATE))
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

    return this.ocaReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        [ 'type', 'ro_id', 'message', 'npa', 'nxx', 'line', 'wild_card_num', 'specific_num', 'status', 'sub_dt_tm', "template_name", "service_order", "eff_dt_tm"],
        'npa,nxx,line,specific_num', custom, include
    ));
  }

  @get('/OCA/{id}', {
    description: 'Get array of OCA Result by ID',
    responses: {
      '200': {
        description: 'OCA Result model instance',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(OcaResult, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async OCA_findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.string('id') id: string,
  ): Promise<OcaResult[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ONE_CLICK_ACTIVATE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.ocaResultRepository.find({where: {req_id: id}, order: ["updated_at asc"]})
  }

  @del('/OCA/{id}', {
    description: 'Delete OCA request',
    responses: {
      '204': {
        description: 'DELETE success',
      }
    }
  })
  async OCA_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.ONE_CLICK_ACTIVATE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.ocaReqRepository.deleteById(id);
  }

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
  async TRQ_retrieve(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: "string",
                },
                email: {
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
  async TRQ_count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let custom: any[] = [];
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      custom.push({ user_id: profile.user.id })
    else
      custom.push({ user_id: userIdFilter=='' ? undefined : userIdFilter })

    return this.trqReqRepository.count(DataUtils.getWhere(value,
        ['sub_dt_tm', 'ro_id','num_list', 'message', 'status', 'total', 'completed'], 'num_list', custom));
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
  async TRQ_find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string,
      @param.query.string('userIdFilter') userIdFilter: string,
  ): Promise<TrqReq[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
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

    return this.trqReqRepository.find(DataUtils.getFilter(limit, skip, order, value,
        ['sub_dt_tm', 'ro_id', 'num_list', 'message', 'status', 'total', 'completed'], 'num_list', custom, include));
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
  async TRQ_findById(
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
        description: 'DELETE success',
      }
    }
  })
  async TRQ_deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.string('id') id: string): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.trqReqRepository.deleteById(id);
  }
}
