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

@Component({
  selector: 'app-roc-rrn',
  templateUrl: './roc-rrn.component.html',
  styleUrls: ['./roc-rrn.component.scss']
})
export class RocRrnComponent implements OnInit {

  inputRespOrgEntity: string = '';
  validRespOrgEntity: boolean = true;

  inputTransactionID: string = '';
  dateRange: any;

  inputRespOrgID: string = '';
  inputTollFreeNumber: string = '';
  validTollFreeNumber: boolean = true;
  selectedNotificationType: any[] = [];

  constructor(
    private messageService: MessageService,
    private store: StoreService,
    public router: Router
  ) { }

  async ngOnInit() {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.ROC_RESEND_SUBSCRIBER_NOTIFICATIONS)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })
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
