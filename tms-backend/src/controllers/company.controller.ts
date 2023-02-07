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
    response, RestHttpErrors, HttpErrors,
} from '@loopback/rest';
import {Company} from '../models';
import {CompanyRepository, UserRepository} from '../repositories';
import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import AuditionedUtils from "../utils/audition";
import {MESSAGES} from "../constants/messages";
import {PERMISSIONS} from "../constants/permissions";

@authenticate('jwt')
export class CompanyController {
    constructor(
        @repository(CompanyRepository)
        public companyRepository: CompanyRepository,

        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {
    }

    @post('/companies', {
        description: 'Add company',
        responses: {
            '200': {
                description: 'Company model instance',
                content: {'application/json': {schema: getModelSchemaRef(Company)}},
            }
        }
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Company, {
                        title: 'NewCompany',
                        exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at', 'status'],
                    }),
                },
            },
        })
            company: Omit<Company, 'id,created_at,created_by,updated_at,updated_by,status'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<Company> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        let isExist = await this.companyRepository.findOne({where: {name: company.name}})
        if (isExist)
            throw new HttpErrors.BadRequest("The company(same name) have already existed!")

        isExist = await this.companyRepository.findOne({where: {code: company.code}})
        if (isExist)
            throw new HttpErrors.BadRequest("The company(same code) have already existed!")

        company.created_by = profile.user.id
        company.created_at = new Date().toISOString()
        company.updated_by = profile.user.id
        company.updated_at = new Date().toISOString()
        company.status = false
        return this.companyRepository.create(company);
    }

    @get('/companies/count', {
        description: 'Get count of all companies',
        responses: {
            '200': {
                description: 'Company model count',
                content: {'application/json': {schema: CountSchema}},
            }
        }
    })
    async count(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.where(Company) where?: Where<Company>,
    ): Promise<Count> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.companyRepository.count(where);
    }

    @get('/companies', {
        description: 'Find companies by filter condition',
        responses: {
            '200': {
                description: 'Array of Company model instances',
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: getModelSchemaRef(Company, {includeRelations: true}),
                        },
                    },
                },
            }
        }
    })
    async find(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.filter(Company) filter?: Filter<Company>,
    ): Promise<Company[]> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.companyRepository.find(AuditionedUtils.includeAuditionedFilter(filter));
    }

    @get('/companies/{id}', {
        description: 'Get company by ID',
        responses: {
            '200': {
                description: 'Company model instance',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Company, {includeRelations: true}),
                    },
                },
            }
        }
    })
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
        @param.filter(Company, {exclude: 'where'}) filter?: FilterExcludingWhere<Company>
    ): Promise<Company> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.READ_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        return this.companyRepository.findById(id, filter);
    }

    @patch('/companies/{id}', {
        description: 'Update company',
        responses: {
            '204': {
                description: 'Company PATCH success',
            }
        }
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Company, {
                        title: 'NewCompany',
                        exclude: ['id', 'created_by', 'created_at', 'updated_by', 'updated_at', 'status'],
                    }),
                },
            },
        })
            company: Omit<Company, 'id,created_at,created_by,updated_at,updated_by,status'>, @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        company.updated_by = profile.user.id
        company.updated_at = new Date().toISOString()
        await this.companyRepository.updateById(id, company);
    }

    @patch('/companies/{id}/status', {
        description: 'update(toggle) status by id',
        responses: {},
    })
    async updateStatusById(
        @param.path.number('id') id: number,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        const company = await this.companyRepository.findById(id)

        let isExist = await this.companyRepository.findOne({where: {name: company.name}})
        if (isExist && isExist.id!=company.id)
            throw new HttpErrors.BadRequest("The company(same name) have already existed!")

        isExist = await this.companyRepository.findOne({where: {code: company.code}})
        if (isExist && isExist.id!=company.id)
            throw new HttpErrors.BadRequest("The company(same code) have already existed!")

        company.updated_by = profile.user.id
        company.updated_at = new Date().toISOString()
        company.status = !company.status
        await this.companyRepository.updateById(id, company);
    }

    @del('/companies/{id}', {
        description: 'Delete company',
        responses: {
            '204': {
                description: 'Company DELETE success',
            }
        }
    })
    async deleteById(@inject(SecurityBindings.USER) currentUserProfile: UserProfile, @param.path.number('id') id: number): Promise<void> {
        const profile = JSON.parse(currentUserProfile[securityId]);
        if (!profile.permissions.includes(PERMISSIONS.WRITE_COMPANY))
            throw new HttpErrors.Unauthorized(MESSAGES.NO_PERMISSION)

        const user = await this.userRepository.findOne({where: { company_id: id }})
        if (user)
            throw new HttpErrors.BadRequest("Someone is using this company. It cannot be deleted.")

        await this.companyRepository.deleteById(id);
    }
}
