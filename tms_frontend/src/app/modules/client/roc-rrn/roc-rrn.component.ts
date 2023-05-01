import { Component, OnInit } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import {
  SPECIFICNUM_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP,
  PAGE_NO_PERMISSION_MSG
 } from '../../constants';
 import { MessageService } from 'primeng/api';
 import { Router } from '@angular/router';
 import { StoreService } from 'src/app/services/store/store.service';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { ApiService } from 'src/app/services/api/api.service';
import moment from 'moment';

@Component({
  selector: 'app-roc-rrn',
  templateUrl: './roc-rrn.component.html',
  styleUrls: ['./roc-rrn.component.scss']
})
export class RocRrnComponent implements OnInit {

  inputRespOrgEntity: string = '';
  validRespOrgEntity: boolean = true;

  inputTransactionID: string = '';
  dateRange: any[] = [new Date(), new Date()];

  inputRespOrgID: string = '';
  inputTollFreeNumber: string = '';
  validTollFreeNumber: boolean = true;
  selectedNotificationType: any[] = [];

  retrieveResult: any;

  constructor(
    private messageService: MessageService,
    private store: StoreService,
    public router: Router,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await new Promise<void>(resolve => {
      let mainUserInterval = setInterval(() => {
        if (this.store.getUser()) {
          clearInterval(mainUserInterval)

          resolve()
        }
      }, 100)
    })
    
    // this.store.state$.subscribe(async (state)=> {

    // })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.ROC_RESEND_SUBSCRIBER_NOTIFICATIONS)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }
  }

  onInputRespOrgEntity = () => {
    if(this.inputRespOrgEntity=='')
      this.validRespOrgEntity = false;
    else
      this.validRespOrgEntity = true;
  }

  onNumFieldFocusOut = () => {
    let num = this.inputTollFreeNumber;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      nums = nums.filter((item, index)=>(nums.indexOf(item)===index));
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

  onClickSearch = () => {

    let data: any = {
      entity: this.inputRespOrgEntity,
      ntfnStartDate: moment(this.dateRange[0]).format('YYYY-MM-DD'),
      ntfnEndDate: moment(this.dateRange[1]).format('YYYY-MM-DD'),
    }

    if(Boolean(this.inputTransactionID))
      data.txnID = this.inputTransactionID;

    if(Boolean(this.inputRespOrgID))
      data.resporg = this.inputRespOrgID

    if(Boolean(this.inputTollFreeNumber))
      data.num = this.inputTollFreeNumber

    if(this.selectedNotificationType.length > 0)
      data.ntfnType = this.selectedNotificationType

    this.api.retrieveListOfFailedNotification(data).subscribe(res=>{
      this.retrieveResult = res;
    });
  }

  onClickClear = () => {

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
