import { Component, OnInit } from '@angular/core';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import * as gFunc from 'src/app/utils/utils';

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
  TFNUM_STATE_SPARE
 } from '../../constants';
import moment from 'moment';

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
  ) { }

  ngOnInit(): void {
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
      this.isResult = true;
    });
  }

  onSave = () => {
    this.api.updateNumberQuery({
      ro: this.store.getCurrentRo(),
      num: this.inputTollFreeNumber,
      status: this.inputStatus,
      contactName: this.inputContactName,
      contactNumber: this.inputContactNumber,
      shortNotes: this.inputNotes,
    }).subscribe(res=>{
      console.log('res', res);
    });
  }

  onCancel = () => {
    this.isResult = false;
    this.inputTollFreeNumber = '';
  }

}
