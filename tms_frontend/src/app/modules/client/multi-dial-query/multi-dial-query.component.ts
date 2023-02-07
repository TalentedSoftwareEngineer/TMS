import { Component, OnInit } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import {
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_COMMON,
  SPECIFICNUM_REG_EXP
 } from '../../constants';

@Component({
  selector: 'app-multi-dial-query',
  templateUrl: './multi-dial-query.component.html',
  styleUrls: ['./multi-dial-query.component.scss']
})
export class MultiDialQueryComponent implements OnInit {
  gConst = {
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_COMMON,
    SPECIFICNUM_REG_EXP
  }

  inputDialNumbers: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;
  inputRequestName: string = '';
  inputMessage: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  constructor() { }

  async ngOnInit() {
    this.activityLogs = [
      {
        id: 1,
        name: 'sadmin',
        createdBy: 'XQG01RXK',
        date: '11/29/2022 05:10 PM',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  onCsvXlUploadAuto = (event: Event) => {

  }

  onSubmit = () => {
    
  }

  onClear = () => {

  }

  onNumFieldFocusOut = () => {
    let num = this.inputDialNumbers;
    if (num !== null && num !== "") {
      let nums = gFunc.retrieveNumListWithHyphen(num)
      console.log("gFunc.retrieveNumListWithHyphen: " + nums.join(","))
      this.inputDialNumbers = nums.join(",");

      let specificNumReg = SPECIFICNUM_REG_EXP
      let isValid = true
      for (let el of nums) {
        console.log("el: " + el)
        if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
          isValid = false
          break
        }
      }
      console.log("Specific: " + isValid)
      if (!isValid) {
        this.invalidNumType = INVALID_NUM_TYPE_COMMON;
      } else {
        this.invalidNumType = INVALID_NUM_TYPE_NONE;
      }
    }
  }

}
