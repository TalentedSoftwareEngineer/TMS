import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent} from "./dashboard/dashboard.component";
import { CompanyComponent } from './company/company.component';
import { SomosUserComponent } from './somos-user/somos-user.component';
import { RoleComponent } from './role/role.component';
import { IdRoComponent } from './id-ro/id-ro.component';
import { UsersComponent } from './users/users.component';
import { AccountComponent } from './account/account.component';
import { SqlUsersComponent } from './sql-users/sql-users.component';
import { SqlScriptsComponent } from './sql-scripts/sql-scripts.component';
import { ScriptExeRecordsComponent } from './script-exe-records/script-exe-records.component';

import {LayoutComponent} from "./layout/layout.component";
import { UserActivityComponent } from './user-activity/user-activity.component';
import { TaskTrackingComponent } from './task-tracking/task-tracking.component';
import { RespOrgComponent } from './resp-org/resp-org.component';
import { NumberSearchComponent } from './number-search/number-search.component';
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

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    data: { title: '' },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {title: 'Dashboard', guiSection: 'Dashboard'},
      },
      {
        path: 'company',
        component: CompanyComponent,
        data: {title: 'Company', guiSection: 'Company'},
      },
      {
        path: 'somos_users',
        component: SomosUserComponent,
        data: {title: 'SomosUser', guiSection: 'SomosUser'},
      },
      {
        path: 'roles',
        component: RoleComponent,
        data: {title: 'Role', guiSection: 'Role'},
      },
      {
        path: 'id_ro',
        component: IdRoComponent,
        data: {title: 'ID & RO', guiSection: 'ID & RO'},
      },
      {
        path: 'users',
        component: UsersComponent,
        data: {title: 'Users', guiSection: 'Users'},
      },
      {
        path: 'account',
        component: AccountComponent,
        data: {title: 'Account', guiSection: 'Account'},
      },
      {
        path: 'sql_users',
        component: SqlUsersComponent,
        data: {title: 'Sql Users', guiSection: 'Sql Users'},
      },
      {
        path: 'sql_scripts',
        component: SqlScriptsComponent,
        data: {title: 'Sql Scripts', guiSection: 'Sql Scripts'},
      },
      {
        path: 'script_exe',
        component: ScriptExeRecordsComponent,
        data: {title: 'Sql Results', guiSection: 'Sql Results'},
      },
      {
        path: 'activity',
        component: UserActivityComponent,
        data: {title: 'User Activity', guiSection: 'User Activity'},
      },
      {
        path: 'task_tracking',
        component: TaskTrackingComponent,
        data: {title: 'Task Tracking', guiSection: 'Task Tracking'},
      },
      {
        path: 'resp_org',
        component: RespOrgComponent,
        data: {title: 'Resp Org Information', guiSection: 'Resp Org Information'},
      },
      {
        path: 'number_search',
        component: NumberSearchComponent,
        data: {title: 'Number Search And Reserve', guiSection: 'Number Search And Reserve'},
      },
      {
        path: 'number_list',
        component: NumberListComponent,
        data: {title: 'Number List', guiSection: 'Number List'},
      },
      {
        path: 'reserved_numbers',
        component: ReservedNumberListComponent,
        data: {title: 'Reserved Number List', guiSection: 'Reserved Number List'},
      },
      {
        path: 'number_query',
        component: NumberQueryComponent,
        data: {title: 'Number Query and Update', guiSection: 'Number Query and Update'},
      },
      {
        path: 'one_click_activation',
        component: OneClickActivationComponent,
        data: {title: 'One Click Activate', guiSection: 'One Click Activate'},
      },
      {
        path: 'trouble_referral_number_query',
        component: ReferralNumberQueryComponent,
        data: {title: 'Trouble Referral Number Query', guiSection: 'Trouble Referral Number Query'},
      },
      {
        path: 'multi_dial_num_query',
        component: MultiDialQueryComponent,
        data: {title: 'Multi Dial Number Query', guiSection: 'Multi Dial Number Query'},
      },
      {
        path: 'multi_dial_num_disconnect',
        component: MultiDialDisconnectComponent,
        data: {title: 'Multi Dial Number Disconnect', guiSection: 'Multi Dial Number Disconnect'},
      },
      {
        path: 'multi_dial_num_spare',
        component: MultiDialSpareComponent,
        data: {title: 'Multi Dial Number Spare', guiSection: 'Multi Dial Number Spare'},
      },
      {
        path: 'multi_dial_num_resp_change',
        component: MultiDialResporgchangeComponent,
        data: {title: 'Multi Dial Number Resp Org Change', guiSection: 'Multi Dial Number Resp Org Change'},
      },
      {
        path: 'multi_conversion_pointer_record',
        component: MultiConversionPointerRecordComponent,
        data: {title: 'Multiple Conversion to Pointer Record', guiSection: 'Multiple Conversion to Pointer Record'},
      },
      {
        path: 'auto_reserve_numbers',
        component: AutoReserveNumbersComponent,
        data: {title: 'Auto Reserve Numbers', guiSection: 'Auto Reserve Numbers'},
      },
      {
        path: 'cad',
        component: CustomerAdminDataComponent,
        data: {title: 'Customer Record Admin Data', guiSection: 'Customer Record Admin Data'},
      },
      {
        path: 'pad',
        component: PointerAdminDataComponent,
        data: {title: 'Pointer Record Admin Data', guiSection: 'Pointer Record Admin Data'},
      },
      {
        path: 'tad',
        component: TemplateAdminDataComponent,
        data: {title: 'Template Admin Data', guiSection: 'Template Admin Data'},
      },
      {
        path: 'trl',
        component: TemplateRecordListComponent,
        data: {title: 'Template Record List', guiSection: 'Template Record List'},
      },
      {
        path: 'roc_rsb',
        component: RocRsbComponent,
        data: {title: 'ROC Submit Request (RSB)', guiSection: 'ROC Submit Request (RSB)'},
      },
      {
        path: 'roc_rsr',
        component: RocRsrComponent,
        data: {title: 'ROC Change Request (RSR)', guiSection: 'ROC Change Request (RSR)'},
      },
      {
        path: 'roc_rlu',
        component: RocRluComponent,
        data: {title: 'ROC LOA Upload (RLU)', guiSection: 'ROC LOA Upload (RLU)'},
      },
      {
        path: 'roc_rsn',
        component: RocRsnComponent,
        data: {title: 'ROC Subscriber Notifications (RSN)', guiSection: 'ROC Subscriber Notifications (RSN)'},
      },
      {
        path: 'roc_rrn',
        component: RocRrnComponent,
        data: {title: 'ROC Resend Subscriber Notifications (RRN)', guiSection: 'ROC Resend Subscriber Notifications (RRN)'},
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {
  static components = [
  ];
}
