// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';


import {authenticate} from "@loopback/authentication";
import {get, getModelSchemaRef, HttpErrors, param, post, put, del, requestBody, response} from "@loopback/rest";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {MESSAGES} from "../constants/messages";
import DataUtils from "../utils/data";
import {TemplateService, TfnRegistryApiService} from "../services";
import {PERMISSIONS} from "../constants/permissions";
import {Role, RoleCreateRequest, Template, TemplateCreateRequest, TemplateRequest} from "../models";
import {repository} from "@loopback/repository";
import {TemplateRepository} from "../repositories";

@authenticate('jwt')
export class TemplateAdministrationController {
  constructor(
      @repository(TemplateRepository)
      public templateRepository: TemplateRepository,
      @service(TemplateService)
      public templateService: TemplateService,
  ) {
  }

  @get('/templates/list', {
    description: 'Get template list',
    responses: {
      '200': {
        description: 'Template Record',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: 'object'
              }
            }
          }
        },
      }
    }
  })
  async template_list(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('ro') ro: string,
      @param.query.string('startTemplateName') startTemplateName?: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (ro=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // GET: cus/tpl/list/entity?entity=XQ&startTmplName=&roId=
    return this.templateService.getList(ro, profile, startTemplateName)
  }

  @get('/templates/query', {
    description: 'Get template',
    responses: {
      '200': {
        description: 'Template Record',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: 'object'
              }
            }
          }
        },
      }
    }
  })
  async template_query(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('ro') ro: string,
      @param.query.string('templateName') templateName: string,
      @param.query.string('effDtTm') effDtTm: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_RECORD_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (ro=="" || templateName=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // GET: cus/tpl/query/{tmplName}
    const response = await this.templateService.getInformation(ro, templateName, effDtTm, profile, true)
    const result: any[] = response.lstEffDtTms

    const template = await this.templateRepository.findOne({where: {name: templateName}})
    result.map(item => item.saved = template ? true : false)

    return result;
  }

  @post('/templates/save')
  @response(200, {
    description: 'Template model instance',
    content: {'application/json': {schema: getModelSchemaRef(Template)}},
  })
  async template_save(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                tmplName: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              }
            },
          },
        },
      })
          tmpl: TemplateCreateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Template> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_RECORD_LIST))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (tmpl.respOrg=="" || tmpl.tmplName=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.templateService.save(profile, tmpl)
  }


  @get('/templates/retrieve', {
    description: 'Retrieve template record',
    responses: {
      '200': {
        description: 'Template Record',
        content: {
          'application/json': {
            schema: {
              type: "array",
              items: {
                type: 'object'
              }
            }
          }
        },
      }
    }
  })
  async template_retrieve(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('ro') ro: string,
      @param.query.string('templateName') templateName: string,
      @param.query.string('effDtTm') effDtTm: string,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (ro=="" || templateName=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    // GET: https://sandbox-api-tfnregistry.somos.com/v3/ip/cus/tpl/tmplName/{tmplName}
    return this.templateService.retrieve(ro, templateName, effDtTm, profile, true)
  }

  @put('/templates/lock')
  @response(200, {
    description: 'Lock template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_lock(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/lockTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.srcTmplName=="" || body.tmplRecCompPart=="" || body.custRecAction=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.templateService.lock(req.ro, body, profile)
  }

  @put('/templates/unlock')
  @response(200, {
    description: 'Unlock template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_unlock(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/unlockTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      return {success: false, message: MESSAGES.MISSING_PARAMETERS}
      // throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.tmplName=="")
      return {success: false, message: MESSAGES.MISSING_PARAMETERS}
      // throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    return this.templateService.unlock(req.ro, body, profile)
  }

  @put('/templates/copy')
  @response(200, {
    description: 'Copy template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_copy(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/copyTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.srcTmplName=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.tmplRecCompPart=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    this.templateService.copy(req.ro, body, profile)

    return { success: true }
  }

  @put('/templates/transfer')
  @response(200, {
    description: 'Transfer template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_transfer(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/copyTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.srcTmplName=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.tmplRecCompPart=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    this.templateService.transfer(req.ro, body, profile)

    return { success: true }
  }

  @put('/templates/disconnect')
  @response(200, {
    description: 'Disconnect template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_disconnect(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/copyTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.srcTmplName=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.tmplRecCompPart=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    this.templateService.disconnect(req.ro, body, profile)

    return { success: true }
  }

  @put('/templates/create')
  @response(200, {
    description: 'Create template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_create(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/createTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    // if (body.srcTmplName=="" || body.tgtEffDtTm=="" || body.cmd=="" || body.tmplRecCompPart=="")
    //   throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    this.templateService.create(req.ro, body, profile)

    return { success: true }
  }

  @put('/templates/update')
  @response(200, {
    description: 'Update template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_update(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/updateTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.tmplName=="" || body.cmd=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    this.templateService.update(req.ro, body, profile)

    return { success: true }
  }

  @put('/templates/delete')
  @response(200, {
    description: 'Delete template record',
    content: {
      'application/json': {
        schema: {
          type: "object",
          properties: {
          }
        }
      }
    },
  })
  async template_delete(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                },
                body: {
                  type: 'string',
                  example: 'https://developer.somos.com/tfn/redoc/v3#operation/deleteTPL'
                },
              },
              required: ['ro', 'body']
            },
          },
        },
      })
          req: TemplateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    if (req.ro=="" || req.body=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    const body = JSON.parse(req.body);
    if (body.tmplName=="" || body.effDtTm=="")
      throw new HttpErrors.BadRequest(MESSAGES.MISSING_PARAMETERS)

    this.templateService.delete(req.ro, body.tmplName, body.effDtTm, profile)

    return { success: true }
  }
}
