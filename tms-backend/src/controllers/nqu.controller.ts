// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {HttpErrors, patch, post, requestBody} from "@loopback/rest";
import {NSRRequest} from "../models/nsr.request";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {NSR_SUBMIT_TYPE, NSR_TYPE, PROGRESSING_STATUS} from "../constants/number_adminstration";
import {NsrReq} from "../models";
import {authenticate} from "@loopback/authentication";
import {NQURequest} from "../models/nqu.request";
import {NumberService} from "../services";

@authenticate('jwt')
export class NQUController {
  constructor(
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
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_QUERY_UPDATE))
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
  async update(
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
    if (!profile.permissions.includes(PERMISSIONS.NUMBER_QUERY_UPDATE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro == "" || req.num == "")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // PUT: num/tfn/update
    return this.numberService.numberUpdate(req, profile)
  }

}
