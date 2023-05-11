// Uncomment these imports to begin using these cool features!

import {inject, service} from '@loopback/core';

import {post,get} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {TfnRegistryApiService} from "../services";

@authenticate('jwt')
export class DashboardController {
  constructor(
      @service(TfnRegistryApiService) public tfnRegistryApiService: TfnRegistryApiService,
  ) {}

  @get('/dashboard/statistics', {
    description: 'Retrieve dashboard data',
    responses: {
      '200': {
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
  async statistics(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);

    let response = await this.tfnRegistryApiService.dashboard(profile)
    console.log("Dashboard", response)

    return response
  }

}
