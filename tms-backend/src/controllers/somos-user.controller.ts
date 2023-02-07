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
import {SomosUser} from '../models';
import {SomosUserRepository, UserRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import AuditionedUtils from "../utils/audition";
import {PERMISSIONS} from "../constants/permissions";
import {MESSAGES} from "../constants/messages";

@authenticate('jwt')
export class SomosUserController {
    constructor(
        @repository(SomosUserRepository)
        public somosUserRepository: SomosUserRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {
    }

    @post('/somos-users', {
        description: 'Create somos user',
        responses: {
            '200': {
                description: 'SomosUser model instance',
                content: {'application/json': {schema: getModelSchemaRef(SomosUser)}},
            }
        }
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(SomosUser, {
                        title: 'NewSomosUser',
                        exclude: ['id', 'created_at', 'created_by', 'updated_at', 'updated_by'],
                    }),
                },
            },
        })
            somosUser: Omit<SomosUser, 'id,created_at,created_by,updated_at,updated_by'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<SomosUser> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_SOMOS_USER))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        somosUser.created_by = profile.user.id
        somosUser.created_at = new Date().toISOString()
        somosUser.updated_by = profile.user.id
        somosUser.updated_at = new Date().toISOString()
        return this.somosUserRepository.create(somosUser);
    }

    @get('/somos-users/count', {
        description: 'Get count of somos users',
        responses: {
            '200': {
                description: 'SomosUser model count',
                content: {'application/json': {schema: CountSchema}},
            }
        }
    })
    async count(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.where(SomosUser) where?: Where<SomosUser>,
    ): Promise<Count> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_SOMOS_USER))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.somosUserRepository.count(where);
    }

    @get('/somos-users', {
        description: 'Get all somos users',
        responses: {
            '200': {
                description: 'Array of SomosUser model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(SomosUser, {includeRelations: true}),
                        },
                    },
                },
            }
        }
    })
    async find(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.filter(SomosUser) filter?: Filter<SomosUser>,
    ): Promise<SomosUser[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_SOMOS_USER))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.somosUserRepository.find(AuditionedUtils.includeAuditionedFilter(filter));
    }

    @get('/somos-users/{id}', {
        description: 'Get somos user',
        responses: {
            '200': {
                description: 'SomosUser model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(SomosUser, {includeRelations: true}),
                    },
                },
            }
        }
    })
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
        @param.filter(SomosUser, {exclude: 'where'}) filter?: FilterExcludingWhere<SomosUser>
    ): Promise<SomosUser> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_SOMOS_USER))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.somosUserRepository.findById(id, filter);
    }

    @patch('/somos-users/{id}', {
        description: 'Update somos user by ID',
        responses: {
            '204': {
                description: 'SomosUser PATCH success',
            }
        }
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(SomosUser, {
                        title: 'NewSomosUser',
                        exclude: ['id', 'created_at', 'created_by', 'updated_at', 'updated_by'],
                    }),
                },
            },
        })
            somosUser: Omit<SomosUser, 'id,created_at,created_by,updated_at,updated_by'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_SOMOS_USER))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        somosUser.updated_by = profile.user.id
        somosUser.updated_at = new Date().toISOString()
        await this.somosUserRepository.updateById(id, somosUser);
    }

    @del('/somos-users/{id}', {
        description: 'Delete somos user',
        responses: {
            '204': {
                description: 'SomosUser DELETE success',
            }
        }
    })
    async deleteById(@param.path.number('id') id: number, @inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_SOMOS_USER))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        const user = await this.userRepository.findOne({where: { somos_id: id }})
        if (user)
            throw new HttpErrors.BadRequest("Someone is using this user. It cannot be deleted.")

        await this.somosUserRepository.deleteById(id);
    }
}
