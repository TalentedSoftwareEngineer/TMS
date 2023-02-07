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
        hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.SQL_SCRIPT_EXECUTION_RECORD) == -1,
        items: [
          { hidden: false, label: 'Sql Script Execution Records', icon: 'pi pi-fw pi-book', link: ROUTES.sql_script_exe },
        ]
      },
      {
        label: 'User Activity And Task',
        hidden: this.isHiddenUserActivityTask(),
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.USER_ACTIVITY) == -1, label: 'User Activity', icon: 'pi pi-fw pi-star', link: ROUTES.activity_task.activity },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TASK_TRACKING) == -1, label: 'Task Tracking', icon: 'pi pi-fw pi-table', link: ROUTES.activity_task.task_tracking },
        ]
      },
      {
        label: 'Resp Org Management',
        hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RESP_ORG_INFORMATION) == -1,
        items: [
          { hidden: false, label: 'Resp Org Information', icon: 'pi pi-fw pi-apple', link: ROUTES.resp_org },
        ]
      },
      {
        label: 'Resp Org Change Tools',
        hidden: false,
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RSB) == -1, label: 'ROC Submit Request (RSB)', icon: 'pi pi-fw pi-twitter', link: ROUTES.roc.rsb },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RSR) == -1, label: 'ROC Change Request (RSR)', icon: 'pi pi-fw pi-slack', link: ROUTES.roc.rsr },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RLU) == -1, label: 'ROC LOA Upload (RLU)', icon: 'pi pi-fw pi-cloud-upload', link: ROUTES.roc.rlu },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RSN) == -1, label: 'ROC Subscriber Notifications (RSN)', icon: 'pi pi-fw pi-heart', link: ROUTES.roc.rsn },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RRN) == -1, label: 'ROC Resend Subscriber Notifications (RRN)', icon: 'pi pi-fw pi-ticket', link: ROUTES.roc.rrn },
        ]
      },
      {
        label: 'Customer Administration',
        hidden: this.isHiddenCustomerAdministration(),
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.CAD) == -1, label: 'Customer Admin Data', icon: 'pi pi-fw pi-reddit', link: ROUTES.customerAdmin.cad },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.PAD) == -1, label: 'Pointer Admin Data', icon: 'pi pi-fw pi-stop', link: ROUTES.customerAdmin.pad },
        ]
      },
      {
        label: 'Template Administration',
        hidden: this.isHiddenTemplateAdministration(),
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TAD) == -1, label: 'Template Admin Data', icon: 'pi pi-fw pi-qrcode', link: ROUTES.templateAdmin.tad },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TRL) == -1, label: 'Template Record List', icon: 'pi pi-fw pi-box', link: ROUTES.templateAdmin.trl },
        ]
      },
      {
        label: 'Number Administration',
        hidden: this.isHiddenNumberAdministration(),
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.SEARCH_NUMBER) == -1, label: 'Number Search', icon: 'pi pi-fw pi-filter', link: ROUTES.numberAdministration.numberSearch },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.NUMBER_LIST) == -1, label: 'Number List', icon: 'pi pi-fw pi-list', link: ROUTES.numberAdministration.numberList },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RESERVE_NUMBER_LIST) == -1, label: 'Reserved Number List', icon: 'pi pi-fw pi-server', link: ROUTES.numberAdministration.reservedNumberList },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.NUMBER_QUERY_UPDATE) == -1, label: 'Number Query', icon: 'pi pi-fw pi-align-right', link: ROUTES.numberAdministration.numberQuery },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.ONE_CLICK_ACTIVATE) == -1, label: 'One Click Activation', icon: 'pi pi-fw pi-map-marker', link: ROUTES.numberAdministration.oneClickActivation },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY) == -1, label: 'Trouble Referral Number Query', icon: 'pi pi-fw pi-stop-circle', link: ROUTES.numberAdministration.troubleReferralNumberQuery },
        ]
      },
      {
        label: 'System Automation Administration',
        hidden: this.isHiddenSystemAutomationAdministration(),
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MNQ) == -1, label: 'Multi Dial Number Query', icon: 'pi pi-fw pi-align-left', link: ROUTES.sysAutoAdmin.multiDialNumQuery },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MND) == -1, label: 'Multi Dial Number Disconnect', icon: 'pi pi-fw pi-spinner', link: ROUTES.sysAutoAdmin.multiDialNumDisconnect },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MSP) == -1, label: 'Multi Dial Number Spare', icon: 'pi pi-fw pi-bookmark', link: ROUTES.sysAutoAdmin.multiDialNumSpare },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MRO) == -1, label: 'Multi Dial Number Resp Org Change', icon: 'pi pi-fw pi-sliders-v', link: ROUTES.sysAutoAdmin.multiDialNumRespOrgChange },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MCP) == -1, label: 'Multiple Conversion to Pointer Record', icon: 'pi pi-fw pi-hashtag', link: ROUTES.sysAutoAdmin.multiConversion_pointerRecord },
          { hidden: false, label: 'Auto Reserve Numbers', icon: 'pi pi-fw pi-tag', link: ROUTES.sysAutoAdmin.autoReserveNumbers },
        ]
      },
      {
        label: 'Settings',
        hidden: this.isHiddenSettings(),
        items: [
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_ROLE) == -1, label: 'Roles', icon: 'pi pi-fw pi-check-circle', link: ROUTES.configuration.roles },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_USER) == -1, label: 'Users', icon: 'pi pi-fw pi-user', link: ROUTES.configuration.users },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_COMPANY) == -1, label: 'Company', icon: 'pi pi-fw pi-building', link: ROUTES.configuration.company },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_SOMOS_USER) == -1, label: 'Somos Users', icon: 'pi pi-fw pi-users', link: ROUTES.configuration.somos_users },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_ID_RO) == -1, label: 'ID & RO', icon: 'pi pi-fw pi-credit-card', link: ROUTES.configuration.id_ro },
          { hidden: this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_SQL_SCRIPT) == -1, label: 'SQL Scripts', icon: 'pi pi-fw pi-database', items: [
              { hidden: false, label: 'SQL Users', icon: 'pi pi-fw pi-code', link: ROUTES.configuration.sql_users },
              { hidden: false, label: 'SQL Scripts', icon: 'pi pi-fw pi-align-center', link: ROUTES.configuration.sql_scripts },
            ]
          },
        ]
      },
    ];      
  }

  isHiddenTemplateAdministration = () => (
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TAD) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TRL) == -1
  );

  isHiddenCustomerAdministration = () => (
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.CAD) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.PAD) == -1
  );

  isHiddenUserActivityTask = () => (
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.USER_ACTIVITY) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TASK_TRACKING) == -1
  );

  isHiddenNumberAdministration = () => (
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.SEARCH_NUMBER) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.NUMBER_LIST) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.RESERVE_NUMBER_LIST) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.NUMBER_QUERY_UPDATE) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.ONE_CLICK_ACTIVATE) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.TROUBLE_REFERRAL_NUMBER_QUERY) == -1
  );

  isHiddenSystemAutomationAdministration = () => (
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MNQ) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MND) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MSP) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MRO) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.MCP) == -1
  );

  isHiddenSettings = () => (
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_ROLE) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_USER) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_COMPANY) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_SOMOS_USER) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_ID_RO) == -1 &&
    this.store.getUser()?.permissions?.indexOf(PERMISSIONS.READ_SQL_SCRIPT) == -1
  );
}
