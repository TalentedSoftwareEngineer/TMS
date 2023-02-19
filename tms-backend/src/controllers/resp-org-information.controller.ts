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

    let response = await this.tfnRegistryApiService.listRespOrgEntity(profile)
    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)
    } else if (response.reqId!=null) {
      throw new HttpErrors.BadRequest("Request is in progress. ReqID: " + response.reqId)

    } else if (response.respOrgList!=null)
      return response.respOrgList;

    throw new HttpErrors.InternalServerError
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

    let response = await this.tfnRegistryApiService.listRespOrgUnit(profile)
    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)
    } else if (response.reqId!=null) {
      throw new HttpErrors.BadRequest("Request is in progress. ReqID: " + response.reqId)

    } else if (response.respOrgList!=null)
      return response.respOrgList;

    throw new HttpErrors.InternalServerError
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

    let response = null;
    if (by=="unit")
      response = await this.tfnRegistryApiService.retrieveRespOrgByUnit(value, profile)

    if (by=="entity")
      response = await this.tfnRegistryApiService.retrieveRespOrgByEntity(value, profile)

    if (by=="number")
      response = await this.tfnRegistryApiService.retrieveRespOrgByNumber(value, profile)

    if (response==null) {
      throw new HttpErrors.BadRequest(MESSAGES.EMPTY_RESPONSE)

    } else if (response.errList!=null) {
      let message = "";

      if (response.errList.length>0) {
        const error: any = response.errList[0];
        message = error.errMsg + " Code: " + error.errCode
      } else
        message = MESSAGES.INTERNAL_SERVER_ERROR

      throw new HttpErrors.BadRequest(message)

    } else if (response.reqId!=null) {
      throw new HttpErrors.BadRequest("Request is in progress. ReqID: " + response.reqId)
    }

    return response;
  }

}
