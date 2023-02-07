import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from "../models";
import {CompanyRepository, RoleRepository, UserRepository} from "../repositories";
import {repository} from "@loopback/repository";
import {UserService} from "@loopback/authentication";
import {compare} from "bcryptjs";
import {Credentials} from "@loopback/authentication-jwt";
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import {MESSAGES} from "../constants/messages";


export class BasicAuthenticationUserService
    implements UserService<User, Credentials>
{
    constructor(
        @repository(UserRepository)
        private userRepository: UserRepository,

        @repository(RoleRepository)
        private roleRepository: RoleRepository,

        @repository(CompanyRepository)
        private companyRepository: CompanyRepository,
    ) {}

    async verifyCredentials(
        credentials: Credentials,
    ): Promise<User> {
        if (!credentials) {
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);
        }

        if (!credentials.email) {
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);
        }

        if (!credentials.password) {
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);
        }

        const foundUser = await this.userRepository.findOne({where: {username: credentials.email}});
        if (!foundUser) {
            throw new HttpErrors.Unauthorized(`User with username ${credentials.email} not found.`);
        }

        const credentialsFound = await this.userRepository.getCredentials(foundUser.id);
        if (!credentialsFound) {
            throw new HttpErrors.Unauthorized("Invalid username or password");
        }

        const credentialsPassword = await hash(credentials.password, credentialsFound.salt);

        // console.log(credentialsPassword, "-->", credentialsFound.password)
        // const passwordMatched = await compare(
        //     credentialsPassword,
        //     credentialsFound.password,
        // );

        if (credentialsPassword != credentialsFound.password) {
            throw new HttpErrors.Unauthorized('The password is not correct.');
        }

        if (!foundUser.status)
            throw new HttpErrors.Unauthorized('This account is not activated. Please contact support center.');

        if (foundUser.ro==null || foundUser.ro=="")
            throw new HttpErrors.Unauthorized('This account have not Resp Org Information. Please contact support center.');

        return foundUser;
    }

    convertToUserProfile(credentials: any): UserProfile {
        if (!credentials) {
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);
        }

        if (!credentials.user.id) {
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);
        }

        return {
            [securityId]: JSON.stringify(credentials),
            id: credentials.user.id,
            name: credentials.user.username,
        };
    }

    async getUserCredentials(userId: number) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);

        const info = await this.userRepository.getInfo(userId)
        const permissions = await this.roleRepository.getPermissions(user.role_id)
        const company = await this.userRepository.getCompany(userId)
        const somos = await this.userRepository.getSomosUser(userId)

        return { user, info, company, somos, permissions }
    }

    async getUserCredentialsForSecurity(user: User) {
        if (!user)
            throw new HttpErrors.Unauthorized(MESSAGES.NO_CREDENTIALS);

        // const info = await this.userRepository.getInfo(user.id)
        const permissions = await this.roleRepository.getPermissions(user.role_id)
        // const company = await this.userRepository.getCompany(user.id)
        const somos = await this.userRepository.getSomosUser(user.id)

        return { user, permissions, somos } // info, company, somos,
    }
}