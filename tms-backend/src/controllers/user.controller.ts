import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository, Transaction,
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
import {
  Company,
  User,
  UserCreateRequest,
  UserCredentials,
  UserInfo,
  UserPasswordUpdateRequest,
  UserSomosRequest, UserUISettingsRequest
} from '../models';
import {UserCredentialsRepository, UserInfoRepository, UserRepository} from '../repositories';
import {authenticate, TokenService} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {IdAndRO} from "../models/id_ro";
import AuditionedUtils from "../utils/audition";
import {hash, genSalt} from "bcryptjs";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";

@authenticate('jwt')
export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
  ) {}

  @post('/users', {
    description: 'Create user',
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User)}},
      },
      '400': {
        description: 'Username is already existed',
      }
    }
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: "object",
            properties: {
              username: {
                type: "string",
              },
              email: {
                type: "string",
              },
              first_name: {
                type: "string",
              },
              last_name: {
                type: "string",
              },
              company_id: {
                type: "integer",
              },
              somos_id: {
                type: "integer",
              },
              role_id: {
                type: "integer",
              },
              password: {
                type: "string",
              },
              country: {
                type: "string",
              },
              address: {
                type: "string",
              },
              province: {
                type: "string",
              },
              city: {
                type: "string",
              },
              zip_code: {
                type: "string",
              },
              tel1: {
                type: "string",
              },
              tel2: {
                type: "string",
              },
              mobile: {
                type: "string",
              },
              fax: {
                type: "string",
              },
              contact_name: {
                type: "string",
              },
              contact_number: {
                type: "string",
              },
            },
            required: ["username", "email", "first_name", "last_name", "somos_id", "company_id", "role_id", "password"]
          },
        },
      },
    })
    req: UserCreateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const tx = await this.userRepository.beginTransaction()

    const user_already = await this.userRepository.findOne({where: {username: req.username}})
    if (user_already)
      throw new HttpErrors.BadRequest("Username is already existed. Please try with another one!")

    const user = new User()
    user.username = req.username
    user.email = req.email
    user.first_name = req.first_name
    user.last_name = req.last_name
    user.company_id = req.company_id
    user.role_id = req.role_id
    user.somos_id = req.somos_id
    user.created_by = profile.user.id
    user.created_at = new Date().toISOString()
    user.updated_by = profile.user.id
    user.updated_at = new Date().toISOString()
    user.status = false
    const new_user = await this.userRepository.create(user);

    const user_credentials = new UserCredentials()
    // user_credentials.id = new_user.id
    user_credentials.salt = await genSalt()
    user_credentials.password = await hash(req.password, user_credentials.salt);

    user_credentials.created_by = profile.user.id
    user_credentials.created_at = new Date().toISOString()
    user_credentials.updated_by = profile.user.id
    user_credentials.updated_at = new Date().toISOString()
    const new_user_credentials = await this.userRepository.userCredentials(new_user.id).create(user_credentials)

    const info = new UserInfo()
    // user_info.id = new_user.id
    info.country = req.country
    info.address = req.address
    info.province = req.province
    info.city = req.city
    info.zip_code = req.zip_code
    info.tel1 = req.tel1
    info.tel2 = req.tel2
    info.mobile = req.mobile
    info.fax = req.fax
    info.contact_name = req.contact_name
    info.contact_number = req.contact_number
    info.created_by = profile.user.id
    info.created_at = new Date().toISOString()
    info.updated_by = profile.user.id
    info.updated_at = new Date().toISOString()
    const new_user_info = await this.userRepository.userInfo(new_user.id).create(info)

    await tx.commit()
    return new_user
  }

  @get('/users/count', {
    description: 'Get count of users',
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.userRepository.count(where);
  }

  @get('/users', {
    description: 'Get users',
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let include: any[] = []

    if (!filter)
      filter = {}

    if (filter.include)
      include = filter.include

    include.push({relation: 'company'})
    include.push({relation: 'somosUser'})
    include.push({relation: 'role'})
    include.push({relation: 'userInfo'})

    filter.include = include

    return this.userRepository.find(filter);
  }

  @get('/users/{id}', {
    description: 'Get user',
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    // @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.READ_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let include = []
    include.push({relation: 'company'})
    include.push({relation: 'somosUser'})
    include.push({relation: 'role'})
    include.push({relation: 'userInfo'})

    return this.userRepository.findById(id, {include: include});
  }

  @get('/users/{id}/auditioned', {
    description: 'Get user details for auditioned',
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                username: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
                first_name: {
                  type: 'string',
                },
                last_name: {
                  type: 'string',
                },
              }
            },
          },
        },
      }
    }
  })
  async getAuditionedById(
      @param.path.number('id') id: number,
      // @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, {fields: { email: true, username: true, first_name: true, last_name: true}});
  }

  @patch('/users/{id}/primary', {
    description: 'Update primary user information',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updatePrimaryInformation(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'PrimaryUser',
            exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at', 'status', 'somos_id', 'ro', 'ui_settings'],
          }),
        },
      },
    })
    user: Omit<User, 'id,created_at,created_by,updated_at,updated_by,status,ro,somos_id,ui_settings'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    user.updated_by = profile.user.id
    user.updated_at = new Date().toISOString()
    await this.userRepository.updateById(id, user);
  }

  @patch('/users/{id}/somos', {
    description: 'Update somos user information',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updateSomosInformation(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                somos_id: {
                  type: "number",
                },
              }
            },
          },
        },
      })
      user: UserSomosRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.userRepository.updateById(id, {
      somos_id: user.somos_id,
      updated_by: profile.user.id,
      updated_at: new Date().toISOString()
    });
  }

  @patch('/users/{id}/ui_settings', {
    description: 'Update user ui settings',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updateUISettings(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ui_settings: {
                  type: "string",
                },
              }
            },
          },
        },
      })
          user: UserUISettingsRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    await this.userRepository.updateById(id, {
      ui_settings: user.ui_settings,
      updated_by: profile.user.id,
      updated_at: new Date().toISOString()
    });
  }

  @patch('/users/{id}/additional', {
    description: 'Update additional user information',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updateAdditionalInformation(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserInfo, {
              title: 'AdditionalUser',
              exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at'],
            }),
          },
        },
      })
      user: Omit<UserInfo, 'id,created_at,created_by,updated_at,updated_by'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    user.updated_by = profile.user.id
    user.updated_at = new Date().toISOString()
    await this.userRepository.userInfo(id).patch(user)
  }

  @patch('/users/{id}/password', {
    description: 'Update user password',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updatePassword(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                old_password: {
                  type: 'string',
                },
                new_password: {
                  type: 'string',
                },
              }
            },
          },
        },
      })
      password: UserPasswordUpdateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const user = await this.userRepository.getCredentials(id)
    if (!user)
      throw new HttpErrors.BadRequest("credentials.password' is null")

    if (id == profile.user.id) {
      if (password.old_password) {
        const old_password_hash = await hash(password.old_password, user.salt);
        if (old_password_hash!=user.password)
          throw new HttpErrors.BadRequest("old password is wrong!")
      } else {
        throw new HttpErrors.BadRequest("old password is wrong!")
      }
    }

    user.salt = await genSalt()
    user.password = await hash(password.new_password, user.salt)

    user.updated_by = profile.user.id
    user.updated_at = new Date().toISOString()
    await this.userRepository.userCredentials(id).patch(user)
  }

  @patch('/users/{id}/status', {
    description: 'Update user password',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updateStatus(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.path.number('id') id: number
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (id!=profile.user.id && !profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const user = await this.userRepository.findById(id)
    if (!user)
      throw new HttpErrors.BadRequest("invalid user")

    user.status = !user.status
    user.updated_by = profile.user.id
    user.updated_at = new Date().toISOString()

    await this.userRepository.updateById(id, user)
  }

  @del('/users/{id}', {
    description: 'Delete user',
    responses: {
      '204': {
        description: 'User DELETE success',
      }
    }
  })
  async deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_USER))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const tx = await this.userRepository.beginTransaction()

    await this.userRepository.userInfo(id).delete()
    await this.userRepository.userCredentials(id).delete()
    await this.userRepository.deleteById(id);

    await tx.commit();
  }

  @get('/users/id_ro', {
    description: 'Get users for Id and RO',
    responses: {
      '200': {
        description: 'Array of User model instances (only id, username, ro field will be used)',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: false}),
            },
          },
        },
      }
    }
  })
  async findIdAndRO(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_ID_RO))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    return this.userRepository.find(filter, {});
  }

  @patch('/users/{id}/id_ro', {
    description: 'Update user\'s RO',
    responses: {
      '204': {
        description: 'User PATCH success',
      }
    }
  })
  async updateIdAndROById(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                ro: {
                  type: 'string',
                  example: 'XQG01,XQG03'
                },
              }
            },
          },
        },
      })
      ro: IdAndRO, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_ID_RO))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const user = await this.userRepository.findById(id)
    user.ro = ro.ro
    user.updated_by = profile.user.id
    user.updated_at = new Date().toISOString()
    await this.userRepository.updateById(id, user);
  }

}
