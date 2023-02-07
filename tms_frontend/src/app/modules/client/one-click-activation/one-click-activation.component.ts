import { Component, OnInit } from '@angular/core';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import { 
  OCA_NUM_TYPE_RANDOM,
  OCA_NUM_TYPE_WILDCARD,
  WILDCARDNUM_REG_EXP,
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_WILDCARD,
  TFNPA_WILDCAD_REG_EXP,
  INVALID_NUM_TYPE_COMMON,
  INVALID_NUM_TYPE_NPA,
  INVALID_NUM_TYPE_CONS,
  INVALID_NUM_TYPE_AMP,
  OCA_NUM_TYPE_SPECIFIC,
  SPECIFICNUM_REG_EXP,
  SVC_ORDR_NUM_REG_EXP,
  TIME_REG_EXP
 } from '../../constants';
import { tap } from "rxjs/operators";
import * as gFunc from 'src/app/utils/utils';
import moment from 'moment';


@Component({
  selector: 'app-one-click-activation',
  templateUrl: './one-click-activation.component.html',
  styleUrls: ['./one-click-activation.component.scss']
})
export class OneClickActivationComponent implements OnInit {
  gConst = {
    OCA_NUM_TYPE_RANDOM,
    OCA_NUM_TYPE_WILDCARD,
    WILDCARDNUM_REG_EXP,
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_WILDCARD,
    TFNPA_WILDCAD_REG_EXP,
    INVALID_NUM_TYPE_COMMON,
    INVALID_NUM_TYPE_NPA,
    INVALID_NUM_TYPE_CONS,
    INVALID_NUM_TYPE_AMP,
    OCA_NUM_TYPE_SPECIFIC,
    SPECIFICNUM_REG_EXP,
    SVC_ORDR_NUM_REG_EXP,
    TIME_REG_EXP
  }


  input_quantity: number = 1;
  validQty: boolean = true;

  input_consecutive: boolean = false;
  disableCons: boolean = false;

  inputNumberMaskEntry: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;

  npas: any[] = [];
  inputNpa = {name: 'Toll-Free NPA', value: ''}
  inputNxx: string = '';
  validNxx: boolean = true; // the flag to represent that nxx value is valid
  inputLine: string = '';
  validLine: boolean = true;
  templates: any[] = [];
  inputTemplate = {name: '', value: ''};
  inputServiceOrderNum: string = '';
  validSvcOrdrNum: boolean = true;
  timeZones: any[]  = [];
  inputTimeZone = {name: 'Central (C)', value: 'C'}
  inputNumTermLine: string = '';
  validNumTermLine: boolean = true;
  inputEffDate: Date|null = null;
  validEffDate: boolean = true;
  minEffDate: Date = new Date();
  inputEffTime: Date|null = null;
  validEffTime: boolean = true;
  inputNow: boolean = false;
  inputMessage: string = '';

  disableSearch: boolean = false;

  numType: string = OCA_NUM_TYPE_RANDOM;

  results: any[] = [];
  resultLoading: boolean = false;

  constructor(
    public store: StoreService,
    public api: ApiService,
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

    this.timeZones = [
      {name: 'Central (C)', value: 'C'},
      {name: 'Atlantic (A)', value: 'A'},
      {name: 'Bering (B)', value: 'B'},
      {name: 'Eastern (E)', value: 'E'},
      {name: 'Hawaiian-Aleutian (H)', value: 'H'},
      {name: 'Mountain (M)', value: 'M'},
      {name: 'Newfoundland (N)', value: 'N'},
      {name: 'Pacific (P)', value: 'P'},
      {name: 'Alaska (Y)', value: 'Y'},
    ];

    this.results = [
      {
        id: 1,
        createdBy: 'XQG01RXK',
        submitDate: '11/29/2022 05:10 PM',
        type: 'SPECIFIC',
        eff_dt: 'NOW',
        templateName: '*XQG01-0001',
        total: 1,
        completed: 1,
        message: '',
        progressStatus: true,
      }
    ];
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  onNumFieldFocusOut = () => {

    let num = this.inputNumberMaskEntry;
    if (num !== null && num !== "") {

      let nums = gFunc.retrieveNumListWithHyphen(num)
      console.log("gFunc.retrieveNumListWithHyphen: " + nums.join(","))
      this.inputNumberMaskEntry = nums.join(",");

      if (num.includes('*') || num.includes('&')) { // to wildcard mode

        console.log("Wildcard")
        this.numType = OCA_NUM_TYPE_WILDCARD;
        this.inputNpa = {name: 'Toll-Free NPA', value: ''};
        this.inputNxx = ''
        this.validNxx = true;
        this.inputLine = '';
        this.validLine = true;

        // check if the number is wildcard number
        let wildcardNumReg = WILDCARDNUM_REG_EXP
        let isValidWildcard = true

        if (num.length > 12)
          isValidWildcard = false

        if (isValidWildcard && !wildcardNumReg.test(num))
          isValidWildcard = false

        let ampCount = 0
        if (isValidWildcard && num.includes("&")) {
          ampCount = 1
          let index = num.indexOf("&")
          if (num.includes("&", index + 1))
            ampCount = 2
        }

        if (!isValidWildcard) {
          if (nums.length > 1)
            this.invalidNumType = INVALID_NUM_TYPE_WILDCARD
          else if (TFNPA_WILDCAD_REG_EXP.test(num))
            this.invalidNumType = INVALID_NUM_TYPE_COMMON
          else
            this.invalidNumType = INVALID_NUM_TYPE_NPA

        } else if (this.input_consecutive && this.input_quantity > 1 && num[num.length - 1] !== '*') {
          this.invalidNumType = INVALID_NUM_TYPE_CONS

        } else if (ampCount === 1) {
          this.invalidNumType = INVALID_NUM_TYPE_AMP

        } else {
          this.invalidNumType = INVALID_NUM_TYPE_NONE;
          this.disableSearch = this.input_quantity > 10;
        }

      } else {  // to specific mode
        this.numType = OCA_NUM_TYPE_SPECIFIC;
        this.input_quantity = 1;
        this.validQty = true;
        this.disableCons = false;
        this.inputNpa = {name: 'Toll-Free NPA', value: ''};
        this.inputNxx = '';
        this.validNxx = true;
        this.inputLine = '';
        this.validLine = true;
        console.log("Specific")

        // check if the number list is valid
        let specificNumReg = SPECIFICNUM_REG_EXP
        let isValid = true
        let isNpaInvalid = false
        for (let el of nums) {
          console.log("el: " + el)
          if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
            isValid = false

            if (!TFNPA_WILDCAD_REG_EXP.test(el))
              isNpaInvalid = true

            console.log("Valid is false ")
            break
          }
        }

        console.log("Specific: " + isValid)

        if (!isValid) {
          if (!isNpaInvalid)
            this.invalidNumType = INVALID_NUM_TYPE_COMMON
          else
            this.invalidNumType = INVALID_NUM_TYPE_NPA

        } else if (this.input_consecutive && this.input_quantity > 1) {
          this.invalidNumType = INVALID_NUM_TYPE_CONS

        } else {
          this.invalidNumType = INVALID_NUM_TYPE_NONE;
          this.input_quantity = nums.length;
          this.disableSearch = false;

        }

      }

    } else if (num == null || num === "") {
      this.numType = OCA_NUM_TYPE_RANDOM;
      this.invalidNumType = INVALID_NUM_TYPE_NONE;
      this.disableSearch = this.input_quantity > 10
    }
  }

  onChangeQuantity = (event: Event) => {
    let digitReg = /^[1-9]([0-9]+)?$/g;
    let value = (event.target as HTMLInputElement).value;

    const state = {};

    if (!digitReg.test(value) || parseInt(value) > 1000) {
      this.validQty = false
    } else {
      this.validQty = true

      if (parseInt(value) > 10) {
        this.input_consecutive = false
        this.disableCons = true
        this.disableSearch = true
      } else {
        this.disableCons = false
        this.disableSearch = false
      }
    }

    this.onNumFieldFocusOut()
  }

  /**
   * this is called when the focus of nxx field is lost
   */
  onNXXFieldFocusOut = () => {
    let nxx = this.inputNxx
    let nxxReg = /\d{3}/g

    if (nxx === '' || nxxReg.test(nxx)) {
      this.validNxx = true;
    } else {
      this.validNxx = false;
    }
  }

  /**
   * this is called when the focus of line field is lost
   */
   onLineFieldFocusOut = () => {
    let line = this.inputLine
    let lineReg = /^\d{1,4}$/g

    if (line === '' || lineReg.test(line)) {
      this.validLine = true;
    } else {
      this.validLine = false;
    }
  }

  /**
   * this is called when the focus of service order field is lost
   */
   onSvcOrderFieldFocusOut = () => {
    let svcOrdrNumReg = this.gConst.SVC_ORDR_NUM_REG_EXP
    if (this.inputServiceOrderNum != null && !svcOrdrNumReg.test(this.inputServiceOrderNum)) {
      this.validSvcOrdrNum = false;
    } else {
      this.validSvcOrdrNum = true;
    }
  }

  /**
   * this is called when the focus of numTermLine field is lost
   */
   onNumTermLineFieldFocusOut = () => {
    let line = this.inputNumTermLine;
    let lineReg = /\d{4}/g

    if (lineReg.test(line)) {
      this.validNumTermLine = true;
    } else {
      this.validNumTermLine = false;
    }
  }

  /**
   * this is called when the focus of date field is lost
   */
   onDateFieldFocusOut = () => {
    let effDate = this.inputEffDate;
    if (effDate !== null)
      this.validEffDate = true;
    else
      this.validEffDate = false;
  }

  /**
   * this is called when the focus of time field is lost
   */
  onTimeFieldFocusOut = () => {
    let timeReg = this.gConst.TIME_REG_EXP
    let effTime = moment(this.inputEffTime).format('h:mm A');
    if (this.inputEffTime === null || timeReg.test(effTime))
      this.validEffTime = true;
    else
      this.validEffTime = false;
  }

  onCsvXlUploadAuto = (event: any) => {

  }

  onSearchReserveActivate = () => {

  }

  onReset = () => {

  }

}
