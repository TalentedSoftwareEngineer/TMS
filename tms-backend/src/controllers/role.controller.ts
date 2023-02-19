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
import {Company, Role} from '../models';
import {RolePrivilegeRepository, RoleRepository, UserRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {RoleCreateRequest} from "../models/role.create";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import AuditionedUtils from "../utils/audition";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";
import DataUtils from '../utils/data';

@authenticate('jwt')
export class RoleController {
  constructor(
    @repository(RoleRepository)
    public roleRepository : RoleRepository,

    @repository(UserRepository)
    public userRepository : UserRepository,
  ) {}

  @post('/roles')
  @response(200, {
    description: 'Role model instance',
    content: {'application/json': {schema: getModelSchemaRef(Role)}},
  })
  async create(
      @requestBody({
      content: {
        'application/json': {
          schema: {
            type: "object",
            properties: {
              name: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              privileges: {
                type: "array",
                items: {
                  type: "integer"
                },
                examples: [1,2,3]
              },
            }
          },
        },
      },
    })
    role: RoleCreateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Role> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const tx = await this.roleRepository.beginTransaction()

    const new_role = await this.roleRepository.create({
      name: role.name,
      description: role.description,
      created_by: profile.user.id,
      created_at: new Date().toISOString(),
      updated_by: profile.user.id,
      updated_at: new Date().toISOString(),
    });

    await role.privileges.forEach((item) => {
      this.roleRepository.rolePrivileges(new_role.id).create({privilege_id: item})
    })

    await tx.commit()
    return new_role;
  }

  @get('/roles/count', {
    description: 'Get count of roles',
    responses: {
      '200': {
        description: 'Role model count',
        content: {'application/json': {schema: CountSchema}},
      }
    }
  })
  async count(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.string('value') value: string
  ): Promise<Count> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['name','description'];
    let num_fields = undefined;
    let custom = undefined;
    return this.roleRepository.count(DataUtils.getWhere(value, fields, num_fields, custom));
  }

  @get('/roles', {
    description: 'Get all roles',
    responses: {
      '200': {
        description: 'Array of Role model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Role, {includeRelations: true}),
            },
          },
        },
      }
    }
  })
  async find(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
      @param.query.number('limit') limit: number,
      @param.query.number('skip') skip: number,
      @param.query.string('order') order: string,
      @param.query.string('value') value: string
  ): Promise<Role[]> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let fields = ['name','description'];
    let num_fields = undefined;
    let custom = undefined;
    let include = [
      {
          relation: 'created',
          scope: {
              fields: { username: true, email: true, first_name: true, last_name: true }
          }
      },
      {
        relation: 'updated',
        scope: {
            fields: { username: true, email: true, first_name: true, last_name: true }
        }
      }
    ];
    return this.roleRepository.find(AuditionedUtils.includeAuditionedFilter(DataUtils.getFilter(limit, skip, order, value, fields, num_fields, custom, include)));
  }

  @get('/roles/for_filter', {
    description: 'Get all roles(without checking permission). it\'s used in filter.',
    responses: {
      '200': {
        description: 'Array of Role model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Role, {includeRelations: false}),
            },
          },
        },
      }
    }
  })
  async findForFilter(
  ): Promise<Role[]> {

    return this.roleRepository.find({fields: {id: true, name: true, description: true}});
  }

  @get('/roles/{id}', {
    description: 'Get role',
    responses: {
      '200': {
        description: 'Role model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Role, {includeRelations: true}),
          },
        },
      }
    }
  })
  async findById(
      @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    // @param.filter(Role, {exclude: 'where'}) filter?: FilterExcludingWhere<Role>
  ): Promise<Role> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.READ_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    let include = []
    include.push({relation: 'rolePrivileges'})

    return this.roleRepository.findById(id, {include: include});
  }

  @patch('/roles/{id}', {
    description: 'Update role by ID',
    responses: {
      '204': {
        description: 'Role PATCH success',
      }
    }
  })
  async updateById(
      @param.path.number('id') id: number,
      @requestBody({
      content: {
        'application/json': {
          schema: {
            type: "object",
            properties: {
              name: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              privileges: {
                type: "array",
                items: {
                  type: "integer"
                },
                examples: [1,2,3]
              },
            }
          },
        },
      },
    })
    role: RoleCreateRequest, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const tx = await this.roleRepository.beginTransaction()

    await this.roleRepository.updateById(id, {
      name: role.name,
      description: role.description,
      updated_by: profile.user.id,
      updated_at: new Date().toISOString(),
    });

    await this.roleRepository.rolePrivileges(id).delete()
    await role.privileges.forEach((item) => {
      this.roleRepository.rolePrivileges(id).create({privilege_id: item})
    })

    await tx.commit()
  }

  @del('/roles/{id}', {
    description: 'Delete role',
    responses: {
      '204': {
        description: 'Role DELETE success',
      },
      '403': {
        description: 'someone is using this role.',
      }
    }
  })
  async deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    if (!profile.permissions.includes(PERMISSIONS.WRITE_ROLE))
      throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

    const tx = await this.roleRepository.beginTransaction()

    const user = await this.userRepository.findOne({where: {role_id: id}})
    if (user)
      throw new HttpErrors.BadRequest(`Someone is using this role. It cannot be deleted.`);

    await this.roleRepository.rolePrivileges(id).delete()
    await this.roleRepository.deleteById(id);

    await tx.commit()
  }
}
