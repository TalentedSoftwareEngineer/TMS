import { Component, OnInit } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import { ApiService } from 'src/app/services/api/api.service';
import { StoreService } from 'src/app/services/store/store.service';
import {
  SPECIFICNUM_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP,
  PAGE_NO_PERMISSION_MSG
 } from '../../constants';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-roc-rsr',
  templateUrl: './roc-rsr.component.html',
  styleUrls: ['./roc-rsr.component.scss']
})
export class RocRsrComponent implements OnInit {

  inputTollFreeNumber: string = '';
  validTollFreeNumber: boolean = true;

  statusOptions: any[] = [
    {name: 'All', value: 'ALL'},
    {name: 'Pending', value: 'PENDING'},
    {name: 'Port Processing', value: 'PORT_PROCESSING'},
    {name: 'Ported', value: 'PORTED'},
    {name: 'Declined', value: 'DECLINED'},
    {name: 'Overdue', value: 'OVERDUE'},
    {name: 'Help Desk Request (HDR)', value: 'HDR'},
    {name: 'Invalid', value: 'INVALID'},
    {name: 'Port Failed', value: 'PORT_FAILED'},
    {name: 'Due Date Approval', value: 'DUE_DATE_APPROVAL'},
    {name: 'Expired', value: 'EXPIRED'}
  ];
  selectStatus: string = 'ALL';

  submittedOptions: any[] = [
    {name: 'Last 7 Days', value: '7'},
    {name: 'Last 14 Days', value: '14'},
    {name: 'Last 30 Days', value: '30'},
    {name: 'Last 90 Days', value: '90'},
    {name: 'Last 180 Days', value: '180'},
    {name: 'Date Range', value: '0'},
  ];
  selectSubmitted: string = '7';
  dateRangeSubmitted: any;

  rejectReasonOptions: any[] = [
    {name: 'Select', value: '00'},
    {name: '01 - Customer name mismatch/missing', value: '01'},
    {name: '02 - Address mismatch/missing (verification done if address is different but all other information is the same)', value: '02'},
    {name: '03 - Contact/Customer signature missing', value: '03'},
    {name: '04 - Toll-Free Shared or Bundled', value: '04'},
    {name: '05 - Customer signature date missing/or expired (must be less than 30 days)', value: '05'},
    {name: '06 - Sent to wrong Resp Org', value: '06'},
    {name: '07 - Toll-Free Number not listed on request', value: '07'},
    {name: '08 - All data mismatch', value: '08'},
    {name: '09 - LOA missing or linking Reseller/Subscriber LOA missing', value: '09'},
    {name: '11 - Illegible LOA', value: '11'},
    {name: '12 - More recent LOA (provide copy of LOA to Resp Org)', value: '12'},
    {name: '15 - Unauthorized contact/Customer signature', value: '15'},
    {name: '16 - Auto-rejected by Submitter', value: '16'},
    {name: '17 - Expired', value: '17'},
    {name: '18 - Resp Org is no longer in control of the Toll-Free Number', value: '18'},
    {name: '19 - Toll-Free Number is in Spare status', value: '19'},
    {name: '20 - Toll-Free Number is in Unavailable status', value: '20'},
    {name: '21 - Toll-Free Number belongs to a Port Restricted Resp Orgs', value: '21'},
    {name: '22 - Toll-Free Number is already in control by your organization', value: '22'},
    {name: '23 - Auto-rejected by Help Desk', value: '23'},
  ];
  selectRejectReason: string = '00';

  typeOptions: any[] = [
    {name: 'Incoming', value: 'INCOMING'},
    {name: 'Outgoing', value: 'OUTGOING'}
  ];
  selectType: string = 'INCOMING';

  progressOptions: any[] = [
    {name: 'All', value: 'BOTH'},
    {name: 'Opened', value: 'OPEN'},
    {name: 'Closed', value: 'CLOSED'}
  ];
  selectProgress: string = 'BOTH';

  respOrgOptions: any[] = [];
  selectRespOrg: string = '';

  switchExpidited: boolean = false;
  switchCheckShow: boolean = false;
  switchDenotesExpedited: boolean = false;

  constructor(
    public api: ApiService,
    public store: StoreService,
    private messageService: MessageService,
    public router: Router
  ) { }

  async ngOnInit() {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.ROC_SUBMIT_REQUEST)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    this.setRespOrgOptions();
  }

  setRespOrgOptions = () => {
    this.store.state$.subscribe(async (state)=>{
      if(state.user!=null) {
        let loggedUser_ros = state.user.ro.split(',');
        this.respOrgOptions = loggedUser_ros.map(item=>({name: item, value: item}));
        this.selectRespOrg = loggedUser_ros[0];
      }
    });
  }

  onNumFieldFocusOut = () => {
    let num = this.inputTollFreeNumber;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      this.inputTollFreeNumber = nums.join(",");
      // check if the number list is valid
      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
          isValid = false
          break
        }
      }

      if (!isValid) {
        this.validTollFreeNumber = false
      } else {
        this.validTollFreeNumber = true;
      }
    } else if (num == null || num === "") {
      this.validTollFreeNumber = true;
    }
  }

  onChangeStatus = () => {

  }

  onChangeSubmitted = () => {

  }

  onChangeRejectReason = () => {

  }

  onChangeType = () => {

  }

  onChangeProgress = () => {

  }

  onChangeRespOrg = () => {

  }

  onClickUpdateResults = () => {

  }

  onClickReset = () => {

  }

  onClickExportCSV = () => {

  }

  showWarn = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'warn', summary: 'Warning', detail: msg });
  }
  showError = (msg: string, summary: string) => {
    this.messageService.add({ key: 'tst', severity: 'error', summary: summary, detail: msg });
  }
  showSuccess = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: msg });
  };
  showInfo = (msg: string) => {
    this.messageService.add({ key: 'tst', severity: 'info', summary: 'Info', detail: msg });
  };

}
