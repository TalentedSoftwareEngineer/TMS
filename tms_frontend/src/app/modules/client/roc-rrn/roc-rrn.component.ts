import { Component, OnInit } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import {
  SPECIFICNUM_REG_EXP,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP
 } from '../../constants';

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

  constructor() { }

  async ngOnInit() {
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
        console.log("el: " + el)
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

}
