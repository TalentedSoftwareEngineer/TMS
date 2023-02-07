import {get, getModelSchemaRef, param, post, requestBody,} from '@loopback/rest';
import {authenticate, TokenService} from "@loopback/authentication";
import {TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {inject} from "@loopback/core";
import {BasicAuthenticationUserService} from "../services/basic-authentication-user.service";
import {Company, SomosUser, User, UserInfo} from "../models";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";

export type UserAuthenticateRequest = {
  username: string;
  password: string;
};

export class AuthenticateController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,

    @inject(UserServiceBindings.USER_SERVICE)
    public userService: BasicAuthenticationUserService,
  ) {}

  @post('/authenticate', {
    description: 'Authenticate user credentials and generated token',
    responses: {
      '200': {
        description: 'token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
				user_id: {
					type: 'number',
				}
              },
            },
          },
        },
      },
    },
  })
  async login(
      @requestBody({
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      username: {
                        type: 'string',
                        example: 'sadmin'
                      },
                      password: {
                        type: 'string',
                        example: 'sadmin'
                      }
                    }
                  }
                },
              },
            })
      request: UserAuthenticateRequest,
  ): Promise<{token: string, user_id: number}> {

    const user = await this.userService.verifyCredentials({email: request.username, password: request.password});
    const credentials = await this.userService.getUserCredentialsForSecurity(user);
    const profile = this.userService.convertToUserProfile(credentials);
    const token = await this.jwtService.generateToken(profile);
    return {token: token, user_id: user.id!};
  }

  @authenticate('jwt')
  @get('/authorization', {
    description: 'get Authenticated user credentials',
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: "object",
              properties: {
                user: {
                  'x-ts-type': User
                },
                info: {
                  'x-ts-type': UserInfo
                },
                company: {
                  'x-ts-type': Company
                },
                somos: {
                  'x-ts-type': SomosUser
                },
                permissions: {
                  type: "array",
                  items: {
                    type: "integer"
                  }
                },
              }
            }
          },
        },
      },
    },
  })
  async user(@inject(SecurityBindings.USER) currentUserProfile: UserProfile): Promise<any> {
    const profile = JSON.parse(currentUserProfile[securityId]);
    const credentials = await this.userService.getUserCredentials(profile.user.id);
    return credentials;
  }
}
