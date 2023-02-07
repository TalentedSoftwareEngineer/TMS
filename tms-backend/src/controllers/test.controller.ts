// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {post} from "@loopback/rest";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {NSRRequest} from "../models/nsr.request";
import {NumberService} from "../services";

@authenticate('jwt')
export class TestController {
  constructor(
      @service(NumberService)
      public numberService: NumberService,
  ) {}

  @post('/test/NSR', {
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
  async nsr(@inject(SecurityBindings.USER) currentUserProfile: UserProfile,) {
    const profile = JSON.parse(currentUserProfile[securityId]);
    let req: NSRRequest = {
      cons: "N", contactName: "Ricky Keele", contactNumber: "7272008240", qty: 1, ro: "XQG01", submitType: "SEARCH & RESERVE", type: "RANDOM"
    }

    return this.numberService.searchAndReserve(req, profile)
  }

}
