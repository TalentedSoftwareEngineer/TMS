import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientRoutingModule } from './client-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';

import { LeftmenuComponent } from './leftmenu/leftmenu.component';
import { SharedModule} from './shared/shared.module';

import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {SplitButtonModule} from "primeng/splitbutton";
import {ToggleButtonModule} from "primeng/togglebutton";
import {PanelMenuModule} from "primeng/panelmenu";
import {TableModule} from "primeng/table";
import {ChartModule} from "primeng/chart";
import {PaginatorModule} from "primeng/paginator";
import {SelectButtonModule} from "primeng/selectbutton";
import {AutoCompleteModule} from "primeng/autocomplete";
import {InputTextModule} from "primeng/inputtext";
import {InputSwitchModule} from 'primeng/inputswitch';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ProgressBarModule} from 'primeng/progressbar';
import {DialogModule} from 'primeng/dialog';
import {PanelModule} from 'primeng/panel';
import {StyleClassModule} from 'primeng/styleclass';
import {AccordionModule} from 'primeng/accordion';
import {DropdownModule} from 'primeng/dropdown';
import {PasswordModule} from 'primeng/password';
import {DividerModule} from 'primeng/divider';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TabViewModule} from 'primeng/tabview';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {FileUploadModule} from 'primeng/fileupload';
import {BadgeModule} from 'primeng/badge';
import {TooltipModule} from 'primeng/tooltip';
import {CalendarModule} from 'primeng/calendar';
import { TagModule } from 'primeng/tag';

// @ts-ignore
import {CountToModule} from "angular-count-to";
import {FooterComponent} from "./footer/footer.component";
import {LayoutComponent} from "./layout/layout.component";
import {AppMenuitemComponent} from "./leftmenu/menuitem.component";
import { CompanyComponent } from './company/company.component';
import { SomosUserComponent } from './somos-user/somos-user.component';
import { RoleComponent } from './role/role.component';
import { IdRoComponent } from './id-ro/id-ro.component';
import { UsersComponent } from './users/users.component';

import { CPanelComponent } from '../../components/c-panel/c-panel.component';
import { AccountComponent } from './account/account.component';
import { SqlUsersComponent } from './sql-users/sql-users.component';
import { SqlScriptsComponent } from './sql-scripts/sql-scripts.component';
import { ScriptExeRecordsComponent } from './script-exe-records/script-exe-records.component';
import { UserActivityComponent } from './user-activity/user-activity.component';
import { TaskTrackingComponent } from './task-tracking/task-tracking.component';
import { RespOrgComponent } from './resp-org/resp-org.component';
import { PhoneFormatPipe } from 'src/app/pipes/phone-format.pipe';
import { NumberSearchComponent } from './number-search/number-search.component';
import { ContactInformationModalComponent } from 'src/app/components/ContactInformationModal/contact-information-modal/contact-information-modal.component';
import { NumberListComponent } from './number-list/number-list.component';
import { ReservedNumberListComponent } from './reserved-number-list/reserved-number-list.component';
import { NumberQueryComponent } from './number-query/number-query.component';
import { OneClickActivationComponent } from './one-click-activation/one-click-activation.component';
import { ReferralNumberQueryComponent } from './referral-number-query/referral-number-query.component';
import { MultiDialQueryComponent } from './multi-dial-query/multi-dial-query.component';
import { MultiDialDisconnectComponent } from './multi-dial-disconnect/multi-dial-disconnect.component';
import { MultiDialSpareComponent } from './multi-dial-spare/multi-dial-spare.component';
import { MultiDialResporgchangeComponent } from './multi-dial-resporgchange/multi-dial-resporgchange.component';
import { MultiConversionPointerRecordComponent } from './multi-conversion-pointer-record/multi-conversion-pointer-record.component';
import { AutoReserveNumbersComponent } from './auto-reserve-numbers/auto-reserve-numbers.component';
import { CustomerAdminDataComponent } from './customer-admin-data/customer-admin-data.component';
import { PointerAdminDataComponent } from './pointer-admin-data/pointer-admin-data.component';
import { TemplateAdminDataComponent } from './template-admin-data/template-admin-data.component';
import { TemplateRecordListComponent } from './template-record-list/template-record-list.component';
import { RocRsbComponent } from './roc-rsb/roc-rsb.component';
import { RocRsrComponent } from './roc-rsr/roc-rsr.component';
import { RocRluComponent } from './roc-rlu/roc-rlu.component';
import { RocRsnComponent } from './roc-rsn/roc-rsn.component';
import { RocRrnComponent } from './roc-rrn/roc-rrn.component';
// FullCalendarModule.registerPlugins([ // register FullCalendar plugins
//   dayGridPlugin,
//   timeGridPlugin,
//   interactionPlugin
// ]);

// const maskConfig: Partial<IConfig> = {
//   validation: false
// };

@NgModule({
  imports: [
    CommonModule,
    ClientRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,

    // primeng component modules
    MenuModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    RippleModule,
    PanelMenuModule,
    SplitButtonModule,
    ToggleButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    // ChartModule,
    SelectButtonModule,
    AutoCompleteModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    DialogModule,
    PanelModule,
    StyleClassModule,
    AccordionModule,
    PasswordModule,
    DividerModule,
    CheckboxModule,
    InputTextareaModule,
    RadioButtonModule,
    TabViewModule,
    OverlayPanelModule,
    MessagesModule,
    MessageModule,
    FileUploadModule,
    BadgeModule,
    TooltipModule,
    CalendarModule,
    TagModule,
    
    // ---------------------------------

    CountToModule,
  ],
  declarations: [
    HeaderComponent,
    LeftmenuComponent,
    AppMenuitemComponent,
    FooterComponent,
    LayoutComponent,
    CompanyComponent,
    SomosUserComponent,
    RoleComponent,
    IdRoComponent,
    UsersComponent,
    CPanelComponent,
    AccountComponent,
    SqlUsersComponent,
    SqlScriptsComponent,
    ScriptExeRecordsComponent,
    UserActivityComponent,
    TaskTrackingComponent,
    RespOrgComponent,
    PhoneFormatPipe,
    NumberSearchComponent,
    ContactInformationModalComponent,
    NumberListComponent,
    ReservedNumberListComponent,
    NumberQueryComponent,
    OneClickActivationComponent,
    ReferralNumberQueryComponent,
    MultiDialQueryComponent,
    MultiDialDisconnectComponent,
    MultiDialSpareComponent,
    MultiDialResporgchangeComponent,
    MultiConversionPointerRecordComponent,
    AutoReserveNumbersComponent,
    CustomerAdminDataComponent,
    PointerAdminDataComponent,
    TemplateAdminDataComponent,
    TemplateRecordListComponent,
    RocRsbComponent,
    RocRsrComponent,
    RocRluComponent,
    RocRsnComponent,
    RocRrnComponent
  ],
  providers: [],
  exports: [
    LeftmenuComponent,
    HeaderComponent,
    FooterComponent
  ]
})
export class ClientModule { }
