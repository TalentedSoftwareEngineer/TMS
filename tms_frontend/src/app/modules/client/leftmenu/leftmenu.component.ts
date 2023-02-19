import {Component, ElementRef, OnInit} from '@angular/core';
import {NavigationStart, Router} from "@angular/router";
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {LayoutService} from "../../../services/layout/layout.service";
import { ROUTES } from "../../../app.routes";
import {IUser} from "../../../models/user";
import { BehaviorSubject } from 'rxjs';
import { PERMISSIONS } from 'src/app/consts/permissions';

@Component({
  selector: 'app-leftmenu',
  templateUrl: './leftmenu.component.html',
  styleUrls: ['./leftmenu.component.scss']
})
export class LeftmenuComponent implements OnInit {

  url: string;
  user: any = {};

  menu: any[] = [];

  isMenuLoaded = false

  constructor(
    private router: Router,
    private store: StoreService,
    private api: ApiService,
    public layoutService: LayoutService, public el: ElementRef
  ) {
    this.url = this.router.url;
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Navigation started.
        this.url = event.url;
      }
    });
  }

  ngOnInit(): void {
    this.store.state$.subscribe(async (state)=>{
      this.menu = [
        {
          label: 'Dashboard',
          hidden: false,
          items: [
            { hidden: false, label: 'Dashboard', icon: 'pi pi-fw pi-home', link: ROUTES.dashboard },
          ]
        },
        {
          label: 'Account',
          hidden: false,
          items: [
            { hidden: false, label: 'Account', icon: 'pi pi-fw pi-user-edit', link: ROUTES.account },
          ]
        },
        {
          label: 'Sql Script Execution Records',
          hidden: state.user?.permissions?.indexOf(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD) == -1,
          items: [
            { hidden: false, label: 'Sql Script Execution Records', icon: 'pi pi-fw pi-book', link: ROUTES.sql_script_exe },
          ]
        },
        {
          label: 'User Activity And Task',
          hidden: this.isHiddenUserActivityTask(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.USER_ACTIVITY) == -1, label: 'User Activity', icon: 'pi pi-fw pi-star', link: ROUTES.activity_task.activity },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.TASK_TRACKING) == -1, label: 'Task Tracking', icon: 'pi pi-fw pi-table', link: ROUTES.activity_task.task_tracking },
          ]
        },
        {
          label: 'Resp Org Management',
          hidden: state.user?.permissions?.indexOf(PERMISSIONS.RESP_ORG_INFORMATION) == -1,
          items: [
            { hidden: false, label: 'Resp Org Information', icon: 'pi pi-fw pi-apple', link: ROUTES.resp_org },
          ]
        },
        {
          label: 'Resp Org Change Tools',
          hidden: this.isHiddenRespOrgChangeTools(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.RSB) == -1, label: 'ROC Submit Request (RSB)', icon: 'pi pi-fw pi-twitter', link: ROUTES.roc.rsb },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.RSR) == -1, label: 'ROC Change Request (RSR)', icon: 'pi pi-fw pi-slack', link: ROUTES.roc.rsr },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.RLU) == -1, label: 'ROC LOA Upload (RLU)', icon: 'pi pi-fw pi-cloud-upload', link: ROUTES.roc.rlu },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.RSN) == -1, label: 'ROC Subscriber Notifications (RSN)', icon: 'pi pi-fw pi-heart', link: ROUTES.roc.rsn },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.RRN) == -1, label: 'ROC Resend Subscriber Notifications (RRN)', icon: 'pi pi-fw pi-ticket', link: ROUTES.roc.rrn },
          ]
        },
        {
          label: 'Customer Administration',
          hidden: this.isHiddenCustomerAdministration(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.CAD) == -1, label: 'Customer Admin Data', icon: 'pi pi-fw pi-reddit', link: ROUTES.customerAdmin.cad },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.PAD) == -1, label: 'Pointer Admin Data', icon: 'pi pi-fw pi-stop', link: ROUTES.customerAdmin.pad },
          ]
        },
        {
          label: 'Template Administration',
          hidden: this.isHiddenTemplateAdministration(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.TAD) == -1, label: 'Template Admin Data', icon: 'pi pi-fw pi-qrcode', link: ROUTES.templateAdmin.tad },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.TRL) == -1, label: 'Template Record List', icon: 'pi pi-fw pi-box', link: ROUTES.templateAdmin.trl },
          ]
        },
        {
          label: 'Number Administration',
          hidden: this.isHiddenNumberAdministration(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.SEARCH_NUMBER) == -1, label: 'Number Search', icon: 'pi pi-fw pi-filter', link: ROUTES.numberAdministration.numberSearch },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.NUMBER_LIST) == -1, label: 'Number List', icon: 'pi pi-fw pi-list', link: ROUTES.numberAdministration.numberList },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.RESERVE_NUMBER_LIST) == -1, label: 'Reserved Number List', icon: 'pi pi-fw pi-server', link: ROUTES.numberAdministration.reservedNumberList },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.NUMBER_QUERY_UPDATE) == -1, label: 'Number Query', icon: 'pi pi-fw pi-align-right', link: ROUTES.numberAdministration.numberQuery },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.ONE_CLICK_ACTIVATE) == -1, label: 'One Click Activation', icon: 'pi pi-fw pi-map-marker', link: ROUTES.numberAdministration.oneClickActivation },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY) == -1, label: 'Trouble Referral Number Query', icon: 'pi pi-fw pi-stop-circle', link: ROUTES.numberAdministration.troubleReferralNumberQuery },
          ]
        },
        {
          label: 'System Automation Administration',
          hidden: this.isHiddenSystemAutomationAdministration(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.MNQ) == -1, label: 'Multi Dial Number Query', icon: 'pi pi-fw pi-align-left', link: ROUTES.sysAutoAdmin.multiDialNumQuery },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.MND) == -1, label: 'Multi Dial Number Disconnect', icon: 'pi pi-fw pi-spinner', link: ROUTES.sysAutoAdmin.multiDialNumDisconnect },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.MNS) == -1, label: 'Multi Dial Number Spare', icon: 'pi pi-fw pi-bookmark', link: ROUTES.sysAutoAdmin.multiDialNumSpare },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.MRO) == -1, label: 'Multi Dial Number Resp Org Change', icon: 'pi pi-fw pi-sliders-v', link: ROUTES.sysAutoAdmin.multiDialNumRespOrgChange },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.MCP) == -1, label: 'Multiple Conversion to Pointer Record', icon: 'pi pi-fw pi-hashtag', link: ROUTES.sysAutoAdmin.multiConversion_pointerRecord },
            { hidden: false, label: 'Auto Reserve Numbers', icon: 'pi pi-fw pi-tag', link: ROUTES.sysAutoAdmin.autoReserveNumbers },
          ]
        },
        {
          label: 'Settings',
          hidden: this.isHiddenSettings(state.user),
          items: [
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.READ_ROLE) == -1, label: 'Roles', icon: 'pi pi-fw pi-check-circle', link: ROUTES.configuration.roles },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.READ_USER) == -1, label: 'Users', icon: 'pi pi-fw pi-user', link: ROUTES.configuration.users },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.READ_COMPANY) == -1, label: 'Company', icon: 'pi pi-fw pi-building', link: ROUTES.configuration.company },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.READ_SOMOS_USER) == -1, label: 'Somos Users', icon: 'pi pi-fw pi-users', link: ROUTES.configuration.somos_users },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.READ_ID_RO) == -1, label: 'ID & RO', icon: 'pi pi-fw pi-credit-card', link: ROUTES.configuration.id_ro },
            { hidden: state.user?.permissions?.indexOf(PERMISSIONS.READ_SQL_SCRIPT) == -1, label: 'SQL Scripts', icon: 'pi pi-fw pi-database', items: [
                { hidden: false, label: 'SQL Users', icon: 'pi pi-fw pi-code', link: ROUTES.configuration.sql_users },
                { hidden: false, label: 'SQL Scripts', icon: 'pi pi-fw pi-align-center', link: ROUTES.configuration.sql_scripts },
              ]
            },
          ]
        },
      ];
    });
  }

  isHiddenTemplateAdministration = (user: any) => (
    user?.permissions?.indexOf(PERMISSIONS.TAD) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.TRL) == -1
  );

  isHiddenCustomerAdministration = (user: any) => (
    user?.permissions?.indexOf(PERMISSIONS.CAD) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.PAD) == -1
  );

  isHiddenUserActivityTask = (user: any) => (
    user?.permissions?.indexOf(PERMISSIONS.USER_ACTIVITY) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.TASK_TRACKING) == -1
  );

  isHiddenNumberAdministration = (user: any) => (
    user?.permissions?.indexOf(PERMISSIONS.SEARCH_NUMBER) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.NUMBER_LIST) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.RESERVE_NUMBER_LIST) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.NUMBER_QUERY_UPDATE) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.ONE_CLICK_ACTIVATE) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY) == -1
  );

  isHiddenSystemAutomationAdministration = (user: any) => (
    user?.permissions?.indexOf(PERMISSIONS.MNQ) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.MND) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.MNS) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.MRO) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.MCP) == -1
  );

  isHiddenSettings = (user: any) => (
    user?.permissions?.indexOf(PERMISSIONS.READ_ROLE) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.READ_USER) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.READ_COMPANY) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.READ_SOMOS_USER) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.READ_ID_RO) == -1 &&
    user?.permissions?.indexOf(PERMISSIONS.READ_SQL_SCRIPT) == -1
  );

  isHiddenRespOrgChangeTools = (user: any) => (
    !user?.permissions?.includes(PERMISSIONS.RSB) &&
    !user?.permissions?.includes(PERMISSIONS.RSR) &&
    !user?.permissions?.includes(PERMISSIONS.RLU) &&
    !user?.permissions?.includes(PERMISSIONS.RSN) &&
    !user?.permissions?.includes(PERMISSIONS.RRN)
  );
}
