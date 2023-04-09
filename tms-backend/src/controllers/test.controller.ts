// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {post} from "@loopback/rest";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {NSRRequest} from "../models/nsr.request";
import {NumberService} from "../services";
import * as fs from "fs";
import {repository} from "@loopback/repository";
import {ScriptResultRepository, ScriptSqlRepository} from "../repositories";
import {ScriptResult} from "../models";
import {PROGRESSING_STATUS} from "../constants/number_adminstration";
import {SUPER_ADMIN} from "../constants/configurations";

export class TestController {
  constructor(
      @service(NumberService) public numberService: NumberService,
      @repository(ScriptResultRepository) public scriptResultRepository: ScriptResultRepository,
      @repository(ScriptSqlRepository) public scriptSqlRepository: ScriptSqlRepository,
  ) {}

  @post('/test/import', {
  description: 'Import Number',
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
  async import() {
  }

}
