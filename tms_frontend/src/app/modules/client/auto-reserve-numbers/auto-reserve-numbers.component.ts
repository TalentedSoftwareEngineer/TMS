import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { 
  INVALID_TIME_NONE, 
  INVALID_TIME_ORDER, 
  INVALID_TIME_PAST, 
  INVALID_NUM_TYPE_NONE,
  INVALID_NUM_TYPE_EMPTY,
  INVALID_NUM_TYPE_WILDCARD,
  INVALID_NUM_TYPE_AMP,
  INVALID_NUM_TYPE_COMMON,
  INVALID_NUM_TYPE_TOO_MANY,
  MAX_REQUESTS_AT_A_TIME_LIMIT,
  WILDCARDNUM_REG_EXP,
  TFNUM_REG_EXP
 } from '../../constants';

@Component({
  selector: 'app-auto-reserve-numbers',
  templateUrl: './auto-reserve-numbers.component.html',
  styleUrls: ['./auto-reserve-numbers.component.scss']
})
export class AutoReserveNumbersComponent implements OnInit {

  gConst = {
    INVALID_TIME_NONE, 
    INVALID_TIME_ORDER, 
    INVALID_TIME_PAST, 
    INVALID_NUM_TYPE_NONE,
    INVALID_NUM_TYPE_EMPTY,
    INVALID_NUM_TYPE_WILDCARD,
    INVALID_NUM_TYPE_AMP,
    INVALID_NUM_TYPE_COMMON,
    INVALID_NUM_TYPE_TOO_MANY,
    MAX_REQUESTS_AT_A_TIME_LIMIT,
    WILDCARDNUM_REG_EXP,
    TFNUM_REG_EXP
  }

  timeDiffCT = 0;
  inputStartDateTime: Date|number|null = null;
  invalidStartTime: number = INVALID_TIME_NONE;
  minStartDateTime: Date = new Date(moment().add(1, 'minute').valueOf() - this.timeDiffCT);
  inputStartNow: boolean = true;
  inputEndDateTime: Date|number|null = null;
  invalidEndTime: number = INVALID_TIME_NONE;
  minEndDateTime: Date = new Date(moment().add(11, 'minute').valueOf() - this.timeDiffCT);
  inputEndNow: boolean = true;
  inputAfterMin: number = 5;
  afterMinErr: boolean = false;
  roIds: any[] = [];
  inputRoId = {name: '', value: ''};
  inputRequestsAtATime: string = '100';

  validRequestsAtATime: boolean = true;

  inputWildcards: string = '';
  invalidNumType: number = this.gConst.INVALID_NUM_TYPE_NONE;
  validQty: boolean = true;

  disableSubmit: boolean = true;

  //Auto Reserve Numbers Table
  autoReserveNumbers: any[] = [];
  selectedAutoReserveNumbers: any[] = [];
  autoReserveNumbersLoading: boolean = false;

  constructor() { }

  async ngOnInit() {
    this.roIds = [
      {name: '', value: ''},
      {name: 'XQG01', value: 'XQG01'},
      {name: 'EJT01', value: 'EJT01'},
      {name: 'TTA01', value: 'TTA01'}
    ];

    this.autoReserveNumbers = [
      {
        id: 1,
        startTime: '11/23/2022 09:48:01 AM',
        endTime: '11/23/2022 09:53:01 AM',
        submitTime: '11/23/2022 09:48:02 AM',
        Wildcard: '800-***-****',
        requestsAtATime: '100',
        status: 'Cancelled',
        roId: 'XQG01',
        requestCount: 9095,
        reservedCount: 0,
        note: 'Forbidden'
      },
      {
        id: 2,
        startTime: '10/28/2022 09:08:58 AM',
        endTime: '10/28/2022 09:13:58 AM',
        submitTime: '10/28/2022 09:08:58 AM',
        Wildcard: '877-***-5060',
        requestsAtATime: '10',
        status: 'Timeout',
        roId: 'TTA01',
        requestCount: 2990,
        reservedCount: 150,
        note: ''
      }
    ]
  }

  /**
   * setSubmitable
   */
   setSubmitable() {
    let submitable = true
    if (this.inputWildcards === '') {
      this.invalidNumType = this.gConst.INVALID_NUM_TYPE_EMPTY;
      submitable = false
    }

    if (submitable && !this.validQty)
      submitable = false

    if (submitable && !this.validRequestsAtATime)
      submitable = false

    if (submitable && this.invalidNumType !== INVALID_NUM_TYPE_NONE)
      submitable = false

    if (submitable && !this.inputStartNow && this.invalidStartTime !== INVALID_TIME_NONE)
      submitable = false

    if (submitable && !this.inputEndNow && this.invalidEndTime !== INVALID_TIME_NONE)
      submitable = false

    if (submitable && this.inputEndNow && this.afterMinErr)
      submitable = false

    this.disableSubmit = !submitable;
  }

  /**
   * this is called when the focus of end time field is lost
   */
   onTimeFieldFocusOut = async () => {

    const startNow = this.inputStartNow
    const endNow = this.inputEndNow
    let startTime = this.inputStartDateTime
    let endTime = this.inputEndDateTime
    const afterMin = this.inputAfterMin

    if (!startNow && endNow)
      endTime = moment().valueOf() + afterMin * 60 * 1000
    else if (startNow && !endNow)
      startTime = moment().valueOf()

    let invalidStartTime = INVALID_TIME_NONE
    let invalidEndTime = INVALID_TIME_NONE

    /*
    if (moment(startTime).valueOf() < moment().valueOf() - this.state.timeDiffCT + 10000) {
      invalidStartTime = INVALID_TIME_PAST
    }

    if (moment(endTime).valueOf() < moment().valueOf() - this.state.timeDiffCT + 10000) {
      invalidEndTime = INVALID_TIME_PAST
    }
    */

    if(startTime!=null && endTime!=null) {
      if (startTime >= endTime && invalidStartTime === INVALID_TIME_NONE) {
        invalidStartTime = INVALID_TIME_ORDER
      } 
      if (startTime >= endTime && invalidEndTime === INVALID_TIME_NONE) {
        invalidEndTime = INVALID_TIME_ORDER
      }
    }

    this.invalidStartTime = invalidStartTime;
    this.invalidEndTime = invalidEndTime;

    this.setSubmitable()
  }

  /**
   * this function is called when the focus of number input field is lost
   */
   checkWildcardsValidation = async (value: string) => {

    console.log('>>> wildcards change: ', value)

    let wildcards = value.replaceAll('-', '')
    while (wildcards.includes("  "))
      wildcards = wildcards.replaceAll("  ", ' ')

    wildcards = wildcards.replaceAll(" ", ',')
    wildcards = wildcards.replaceAll("\n", ',')

    while (wildcards.includes(",,"))
      wildcards = wildcards.replaceAll(",,", ',')
    console.log('>>> wildcards after removing space: ', wildcards)
    
    if (wildcards !== "") {

      if (wildcards.includes('*') || wildcards.includes('&')) { // to wildcard mode
        
        const wildcardList = wildcards.split(',')
        console.log('>>> wildcards list: ', wildcardList)

        let invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE
        for (let wildcard of wildcardList) {
          if (!(wildcard.includes('*') || wildcard.includes('&'))) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_WILDCARD
            break
          }

          // check if the number is wildcard number
          let wildcardNumReg = this.gConst.WILDCARDNUM_REG_EXP
          let isValidWildcard = true

          if (wildcard.length > 12)
            isValidWildcard = false

          if (isValidWildcard && !wildcardNumReg.test(wildcard))
            isValidWildcard = false

          let ampCount = 0
          if (isValidWildcard && wildcard.includes("&")) {
            ampCount = 1
            let index = wildcard.indexOf("&")
            if (wildcard.includes("&", index + 1))
              ampCount = 2
          }

          if (!isValidWildcard) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_WILDCARD

          } else if (ampCount === 1) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_AMP

          }
        }
      
        if (invalidNumType === this.gConst.INVALID_NUM_TYPE_NONE) {
          wildcards = ""
          for (let num of wildcardList) {
            wildcards += wildcards === '' ? '' : ', '

            num = num.replaceAll('-', '')
            wildcards += num.substr(0, 3) + '-' + num.substr(3, 3) + '-' + num.substr(6, 4)
          }
          this.invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE;
          this.inputWildcards = wildcards;
          this.setSubmitable()

        } else {
          this.invalidNumType = invalidNumType
          this.disableSubmit = true
        }

      } else {
        const numList = wildcards.split(',')

        let invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE
        for (let num of numList) {

          let isPhoneNumber = true

          if (num.length > 12)
            isPhoneNumber = false

          if (isPhoneNumber && !this.gConst.TFNUM_REG_EXP.test(num))
            isPhoneNumber = false

          if (!isPhoneNumber) {
            invalidNumType = this.gConst.INVALID_NUM_TYPE_COMMON
          }
        }

        console.log('------ invalid num type: ', invalidNumType)

        if (invalidNumType === this.gConst.INVALID_NUM_TYPE_NONE) {
          let numbers = ""
          for (let num of numList) {
            numbers += numbers === '' ? '' : ', '

            num = num.replaceAll('-', '')
            numbers += num.substr(0, 3) + '-' + num.substr(3, 3) + '-' + num.substr(6, 4)
          }

          this.invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE;
          this.inputWildcards = numbers;
          this.setSubmitable();

        } else {
          this.invalidNumType = invalidNumType;
          this.disableSubmit = true;
        }
      }

    } else if (wildcards == null || wildcards === "") {
      this.invalidNumType = this.gConst.INVALID_NUM_TYPE_EMPTY;
      this.disableSubmit = true;
    }
  }

  onInputAfterMin = () => {
    if (this.inputAfterMin <= 0)
      this.afterMinErr = true;
    else
      this.afterMinErr = false;

    this.setSubmitable();
  }

  onInputRequestsAtATime = async () => {
    let digitReg = /^[1-9]([0-9]+)?$/g

    if (!digitReg.test(this.inputRequestsAtATime) || parseInt(this.inputRequestsAtATime) > this.gConst.MAX_REQUESTS_AT_A_TIME_LIMIT) {
      this.validRequestsAtATime = false;
      this.disableSubmit = true
    } else {
      this.validRequestsAtATime = true;
      this.disableSubmit = false;
    }
  }

  onInputWildcards = async () => {
    await this.checkWildcardsValidation(this.inputWildcards);
    this.setSubmitable()
  }

  onSubmit = () => {

  }

  onClear = () => {

  }

  onDelete = () => {
    console.log(this.selectedAutoReserveNumbers);
  }

}
