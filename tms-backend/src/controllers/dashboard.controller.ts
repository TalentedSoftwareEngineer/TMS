// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';

import {post,} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";

@authenticate('jwt')
export class DashboardController {
  constructor() {}

  @post('/dashboard')
  async dashboard(@inject(SecurityBindings.USER)
                  currentUserProfile: UserProfile) {
    return currentUserProfile[securityId];
  }

}
