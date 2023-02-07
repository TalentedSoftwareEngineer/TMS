// import {inject} from '@loopback/core';

import {authenticate} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {TfnRegistryApiService} from "../services";
import {get, HttpErrors, param} from "@loopback/rest";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";

@authenticate('jwt')
export class RespOrgInformationController {
  constructor(
      @service(TfnRegistryApiService)
      public tfnRegistryApiService: TfnRegistryApiService,
  ) {}

  @get('/resp_org/entities', {
    description: 'list all the Resp Org Entities in the system',
    responses: {
      '200': {
        description: 'Array of respOrgEntity',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  respOrgEntity: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    }
  })
  async listEntity(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESP_ORG_INFORMATION))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return await this.tfnRegistryApiService.listRespOrgEntity(profile)
  }

  @get('/resp_org/units', {
    description: 'list all the Resp Org Units in the system',
    responses: {
      '200': {
        description: 'Array of respOrgUnit',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  respOrgId: {
                    type: "string",
                  },
                  status: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    }
  })
  async listUnit(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESP_ORG_INFORMATION))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return await this.tfnRegistryApiService.listRespOrgUnit(profile)
  }

  @get('/resp_org/retrieve/{by}', {
    description: 'retrieve Resp Org Information',
    responses: {
      '200': {
        description: 'Resp Org Information',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                respOrgEntity: {
                  type: "string",
                },
                companyName: {
                  type: "string",
                },
                emailId: {
                  type: "string",
                },
                contactPhone: {
                  type: "string",
                },
                associatedRespOrgs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      respOrgId: {
                        type: "string",
                      },
                      businessUnitName: {
                        type: "string",
                      },
                      email: {
                        type: "string",
                      },
                      troubleRef: {
                        type: "string",
                      },
                      status: {
                        type: "string",
                      },
                    },
                  },
                }
              },
            },
          },
        },
      },
    }
  })
  async retrieveBy(
      @param.path.string('by') by: string,
      @param.query.string('value') value: string,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.RESP_ORG_INFORMATION))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (by=="unit")
      return await this.tfnRegistryApiService.retrieveRespOrgByUnit(value, profile)

    if (by=="entity")
      return await this.tfnRegistryApiService.retrieveRespOrgByEntity(value, profile)

    if (by=="number")
      return await this.tfnRegistryApiService.retrieveRespOrgByNumber(value, profile)
  }

}
