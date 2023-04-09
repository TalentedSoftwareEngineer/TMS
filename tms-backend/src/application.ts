import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RestExplorerBindings, RestExplorerComponent,} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, RestBindings} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {AuthenticationComponent} from "@loopback/authentication";
import {JWTAuthenticationComponent, TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {DbDataSource} from "./datasources";
import {AuthorizationComponent} from "@loopback/authorization";
import {
  AutomationService, BasicAuthenticationUserService, CustomerRecordService, FtpService,
  JobService, MailService,
  MessageQueueService,
  NumberService, PointerRecordService, RespOrgService, Secure382ApiService,
  TemplateService,
  TfnRegistryApiService
} from "./services";
import {UserCredentialsRepository, UserRepository} from "./repositories";
import {QueueManager} from "redis-smq";
import {EQueueType} from "redis-smq/dist/types";
import {CronComponent, CronJob} from "@loopback/cron";
import {AutoReserve} from "./jobs/auto-reserve";
import {AutoImportScript} from "./jobs/auto-import-script";
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
    this.component(CronComponent)
    this.component(AuthorizationComponent);

    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);

    // @ts-ignore
    this.bind(UserServiceBindings.USER_SERVICE).toClass(BasicAuthenticationUserService);
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository);
    this.bind(UserServiceBindings.USER_CREDENTIALS_REPOSITORY).toClass(UserCredentialsRepository);

    this.bind(TokenServiceBindings.TOKEN_SECRET).to("tms_token");
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to("3600");
    this.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({
      json: {limit: '10MB'},
      text: {limit: '10MB'}
    })

    this.service(TfnRegistryApiService);
    this.service(RespOrgService)
    this.service(NumberService);

    this.service(MessageQueueService)
    this.service(AutomationService);
    this.service(JobService);

    this.service(MailService);
    this.service(Secure382ApiService);
    this.service(FtpService)

    this.service(TemplateService);
    this.service(CustomerRecordService);
    this.service(PointerRecordService);

    const autoReserveBinding = createBindingFromClass(AutoReserve)
    this.add(autoReserveBinding)

    const autoImportScriptBinding = createBindingFromClass(AutoImportScript)
    this.add(autoImportScriptBinding)
  }
}
