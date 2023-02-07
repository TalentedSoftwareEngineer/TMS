import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response, HttpErrors,
} from '@loopback/rest';
import {Configuration, TfnRegistryContact, UserInfo} from '../models';
import {
  ConfigurationRepository, NewsEventRepository,
  TfnRegistryContactRepository,
  UserInfoRepository,
  UserRepository
} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {CONFIGURATIONS, SUPER_ADMIN_ROLE} from "../constants/configurations";
import {ConfigurationRequest} from "../models/configuration.request";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import {TfnRegistryContactRequest} from "../models/tfn-registry-contact.request";

@authenticate('jwt')
export class ConfigurationController {
  constructor(
    @repository(ConfigurationRepository)
    public configurationRepository : ConfigurationRepository,
    @repository(NewsEventRepository)
    public newsEventRepository : NewsEventRepository,
    @repository(TfnRegistryContactRepository)
    public tfnRegistryContactRepository : TfnRegistryContactRepository,
    @repository(UserInfoRepository)
    public userInfoRepository : UserInfoRepository,
  ) {}

  @get('/configurations/sqlscript_sftp', {
    description: 'Get sFTP configuration',
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: "string",
            },
          },
        }
      }
    }
  })
  async getSQLScriptSFtpConfiguration(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<string> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const config = await this.configurationRepository.findById(CONFIGURATIONS.SQLSCRIPT_SFTP);
    return config.value;
  }

  @patch('/configurations/sqlscript_sftp')
  @response(204, {
    description: 'Configuration PATCH success',
  })
  async updateSQLScriptSFtpConfiguration(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                },
              },
            },
          },
        },
      })
          config: ConfigurationRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.configurationRepository.updateById(CONFIGURATIONS.SQLSCRIPT_SFTP, {value: config.value});
  }

  @get('/configurations/tfnregistry_contact', {
    description: 'Get TfnRegistry Contact Information',
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                contact_name: {
                  type: "string"
                },
                contact_number: {
                  type: "string"
                }
              }
            },
          },
        }
      }
    }
  })
  async getTfnRegistryContactInformation(
      @param.query.string('ro') ro: string,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    // if (!profile.permissions.includes(PERMISSIONS.READ_SQL_SCRIPT))
    //   throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let response = { contact_name: '', contact_number: ''}

    const info = await this.userInfoRepository.findOne({where: {id: profile.user.id}})
    if (info && info.contact_name!="" && info.contact_number!="") {
      response.contact_name = info.contact_name!
      response.contact_number = info.contact_number!
    } else {
      const contact = await this.tfnRegistryContactRepository.findOne({where: {user_id: profile.user.id, ro: ro}})
      if (contact) {
        response.contact_name = contact.contact_name
        response.contact_number = contact.contact_number
      }
    }

    return response
  }

  @patch('/configurations/tfnregistry_contact')
  @response(204, {
    description: 'Configuration PATCH success',
  })
  async updateTfnRegistryContactInformation(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                contact_name: {
                  type: "string"
                },
                contact_number: {
                  type: "string"
                },
                ro: {
                  type: "string"
                },
                isDefault: {
                  type: "boolean"
                }
              },
            },
          },
        },
      })
          req: TfnRegistryContactRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    // if (!profile.permissions.includes(PERMISSIONS.WRITE_SQL_SCRIPT))
    //   throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let isNew = false
    if (req.isDefault) {
      let user = await this.userInfoRepository.findOne({where: {id: profile.user.id}})
      if (user) {
      } else {
        user = new UserInfo()
        user.created_by = profile.user.id
        user.created_at = new Date().toISOString()
      }

      user.contact_name = req.contact_name
      user.contact_number = req.contact_number

      user.updated_by = profile.user.id
      user.updated_at = new Date().toISOString()

      await this.userInfoRepository.save(user)

    } else {
      let contact = await this.tfnRegistryContactRepository.findOne({where: {user_id: profile.user.id, ro: req.ro}})
      if (contact) {
      } else {
        isNew = true

        contact = new TfnRegistryContact()
        contact.user_id = profile.user.id!
        contact.ro = req.ro
        contact.created_at = new Date().toISOString()
      }

      contact.contact_name = req.contact_name
      contact.contact_number = req.contact_number
      contact.updated_at = new Date().toISOString()

      if (isNew)
        await this.tfnRegistryContactRepository.create(contact)
      else
        await this.tfnRegistryContactRepository.save(contact)
    }

    return { success: true }
  }


  @get('/configurations/news_event', {
    description: 'Get News Event',
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: "string",
            },
          },
        }
      }
    }
  })
  async getNewsEvent(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);

    const config = await this.configurationRepository.findById(CONFIGURATIONS.NEWS_EVENT);
    return { news_event: config.value }
  }

  @patch('/configurations/news_event')
  @response(204, {
    description: 'Configuration PATCH success',
  })
  async updateNewsEvent(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                value: {
                  type: "string",
                },
              },
            },
          },
        },
      })
          config: ConfigurationRequest,
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (profile.user.role_id!=SUPER_ADMIN_ROLE)
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.configurationRepository.updateById(CONFIGURATIONS.NEWS_EVENT, {value: config.value});
    await this.newsEventRepository.create({content: config.value, created_by: profile.user.id, created_at: new Date().toISOString()})
  }

}
