import { Component, OnInit } from '@angular/core';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import * as gFunc from 'src/app/utils/utils';
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import { Router } from '@angular/router';

import {
  CONTACT_NAME_REG_EXP,
  CONTACT_NUMBER_REG_EXP,
  INVALID_NUM_TYPE_TENDIGIT,
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_NPA,
  NUM_REG_EXP,
  TFNUM_REG_EXP,
  TFNUM_STATE_RESERVED,
  TFNUM_STATE_TRANSITIONAL,
  TFNUM_STATE_SPARE,
  PAGE_NO_PERMISSION_MSG
 } from '../../constants';
import moment from 'moment';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-number-query',
  templateUrl: './number-query.component.html',
  styleUrls: ['./number-query.component.scss']
})
export class NumberQueryComponent implements OnInit {

  gConst = {
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_TENDIGIT,
    INVALID_NUM_TYPE_NPA,
    NUM_REG_EXP,
    TFNUM_REG_EXP,
    TFNUM_STATE_RESERVED,
    TFNUM_STATE_TRANSITIONAL,
    TFNUM_STATE_SPARE
  };

  isResult: boolean = false;

  inputTollFreeNumber: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;
  inputDescription: string = '';
  validInputDescription: boolean = true;

  disabled = true;
  retreivedStatus: string = '';
  inputRespOrg: string = '';
  validRespOrg: boolean = true;
  statusOptions: any[] = [];
  selectStatus = '';
  inputStatus: string = '';
  inputEffDate: string = '';
  inputReservedUntil: string|number|Date|null = null;
  inputLastActiveDate: string = '';

  inputContactName: string = '';
  validInputContactName: boolean = true;
  inputContactNumber: string = '';
  validInputContactNumber: boolean = true;
  inputNotes: string = '';

  recVersionId: any;

  constructor(
    public store: StoreService,
    public api: ApiService,
    private messageService: MessageService,
    public router: Router
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

    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.NUMBER_QUERY)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    if(this.retreivedStatus === this.gConst.TFNUM_STATE_RESERVED) {
      this.statusOptions = [
        {name: this.retreivedStatus, value: this.retreivedStatus},
        {name: 'SPARE', value: this.gConst.TFNUM_STATE_SPARE},
      ];
    } else {
      this.statusOptions = [
        {name: this.retreivedStatus, value: this.retreivedStatus},
        {name: 'RESERVED', value: this.gConst.TFNUM_STATE_RESERVED},
      ];
    }

    this.onCancel();
  }

  onInputContactName = () => {
    this.validInputContactName = CONTACT_NAME_REG_EXP.test(this.inputContactName==undefined?'':this.inputContactName);
  }

  onInputContactNumber = () => {
    this.validInputContactNumber = CONTACT_NUMBER_REG_EXP.test(this.inputContactNumber==undefined?'':this.inputContactNumber);
  }

  onInputDescription = () => {
    this.validInputDescription = /^[\w\d\s`'!@#$%&*()-_+={}\[\]\:;<>,.?/.]{1,60}$/.test(this.inputDescription);
  }

  onRetrieve = (): any => {
    this.isResult = false;
    this.inputTollFreeNumber = this.inputTollFreeNumber.replace(/\W/g, '');

    let numRegExp = this.gConst.NUM_REG_EXP
    let tfNumRegExp = this.gConst.TFNUM_REG_EXP
    if (!numRegExp.test(this.inputTollFreeNumber)) {
      this.invalidNumType = INVALID_NUM_TYPE_TENDIGIT;
      return false;
    } else if (!tfNumRegExp.test(this.inputTollFreeNumber)) {
      this.invalidNumType = INVALID_NUM_TYPE_NPA;
      return false;
    } else  {
      this.invalidNumType = INVALID_NUM_TYPE_NONE;
    }

    let body = {
      ro: this.store.getCurrentRo(),
      num: this.inputTollFreeNumber
    }

    this.api.retrieveNumberQuery(body).subscribe(res=>{
      this.inputRespOrg = res.ctrlRespOrgId;
      this.selectStatus = res.status;
      this.inputStatus = res.status;
      this.inputEffDate = res.effDt;
      // this.inputReservedUntil = moment(new Date(res.resUntilDt)).format('YYYY/MM/DD');
      this.inputLastActiveDate = res.lastActDt;
      this.inputContactName = res.conName;
      this.inputContactNumber = res.conName;
      this.inputNotes = res.shrtNotes;
      this.recVersionId = res.recVersionId;
      this.isResult = true;
    });
  }

  onSave = () => {
    this.onInputContactName()
    this.onInputContactNumber()
    if (!this.validInputContactName || !this.validInputContactNumber)
      return

    this.api.updateNumberQuery({
      recVersionId: this.recVersionId,
      ro: this.store.getCurrentRo(),
      num: this.inputTollFreeNumber,
      status: this.inputStatus,
      contactName: this.inputContactName,
      contactNumber: this.inputContactNumber,
      shortNotes: this.inputNotes,
    }).subscribe(res=>{
      if(res.errList) {
        this.showError(`${res.errList[0].errMsg} Code: ${res.errList[0].errCode}`, 'Error');
      }
    });
  }

  onCancel = () => {
    this.isResult = false;
    this.inputTollFreeNumber = '';
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
