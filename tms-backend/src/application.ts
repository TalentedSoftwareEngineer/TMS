import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent,} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {AuthenticationComponent} from "@loopback/authentication";
import {JWTAuthenticationComponent, TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {DbDataSource} from "./datasources";
import {BasicAuthenticationUserService} from "./services/basic-authentication-user.service";
import {AuthorizationComponent} from "@loopback/authorization";
import {MessageQueueService, NumberService, TfnRegistryApiService} from "./services";
import {UserCredentialsRepository, UserRepository} from "./repositories";
import {QueueManager} from "redis-smq";
import {EQueueType} from "redis-smq/dist/types";

export {ApplicationConfig};

export class BackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    // @ts-ignore
    this.bind(UserServiceBindings.USER_SERVICE).toClass(BasicAuthenticationUserService);
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository);
    this.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(UserCredentialsRepository);

    this.bind(TokenServiceBindings.TOKEN_SECRET).to("tms_token");
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to("3600");

    this.service(MessageQueueService)
    this.service(TfnRegistryApiService);
    this.service(NumberService);

    this.component(AuthorizationComponent);
  }
}
