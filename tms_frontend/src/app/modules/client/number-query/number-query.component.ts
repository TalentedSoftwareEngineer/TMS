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

  disabled = false;
  retreivedStatus: string = '';
  inputRespOrg: string = '';
  validRespOrg: boolean = true;
  statusOptions: any[] = [];
  selectStatus = {name: this.retreivedStatus, value: this.retreivedStatus};
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
      numList:[
        this.inputTollFreeNumber.replace(/\-/g, "")
      ],
      requestDesc: this.inputDescription
    }

    this.api.retrieveNumberQuery(body).subscribe(res=>{
      if (res.ok && res.data && res.data.queryResult) {

        let result = res.data.queryResult[0]
        let effDate = ""
        if (result.effDt)
          effDate = gFunc.fromUTCDateStrToCTDateStr(result.effDt)

        let lastActDt = ""
        if (result.lastActDt)
          lastActDt = gFunc.fromUTCDateStrToCTDateStr(result.lastActDt)

        let contactName = ""
        if (result.conName)
          contactName = result.conName

        let contactNumber = ""
        if (result.conPhone)
          contactNumber = result.conPhone

        let notes = ""
        if (result.shrtNotes)
          notes = result.shrtNotes

        let reservedUntil: string|number|Date|null = ""
        if (result.resUntilDt)
          reservedUntil = new Date(result.resUntilDt).getTime()

        this.inputRespOrg = result.ctrlRespOrgId;
        this.retreivedStatus = result.status;
        this.inputStatus = result.status;
        this.selectStatus = {name: result.status, value: result.status};
        this.inputEffDate = effDate;
        this.inputLastActiveDate = lastActDt;
        this.inputContactName = contactName;
        this.inputContactNumber = contactNumber;
        this.inputNotes = notes;
        this.inputReservedUntil = reservedUntil;
        this.recVersionId = result.recVersionId;
        this.isResult = true;

        if (result.status !== this.gConst.TFNUM_STATE_RESERVED && result.status !== this.gConst.TFNUM_STATE_TRANSITIONAL) {
          this.disabled = true;
        } else {
          // if (this.props.somos.ro.indexOf(result.ctrlRespOrgId) === -1)
          //   this.setState({disabled: true})
          // else
          //   this.setState({disabled: false})

          this.disabled = false;
        }

      }
    });
  }

  onInputContactName = () => {
    this.validInputContactName = CONTACT_NAME_REG_EXP.test(this.inputContactName==undefined?'':this.inputContactName);
  }

  onInputContactNumber = () => {
    this.validInputContactNumber = CONTACT_NUMBER_REG_EXP.test(this.inputContactNumber==undefined?'':this.inputContactNumber);
  }

  onSave = () => {

  }

  onCancel = () => {
    this.isResult = false;
    this.inputTollFreeNumber = '';
  }

}
