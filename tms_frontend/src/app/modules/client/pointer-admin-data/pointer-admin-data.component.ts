import { Component, OnInit } from '@angular/core';
import * as gFunc from 'src/app/utils/utils';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {closeEventSource, SseClient} from "angular-sse-client";
import Cookies from "universal-cookie";
import { Router } from '@angular/router';
import {
  PAD_RETRIEVE_SUCCESSFUL,
  ACTION_NONE,
  ACTION_ALL,
  ACTION_CREATE,
  ACTION_UPDATE,
  ACTION_COPY,
  ACTION_TRANSFER,
  ACTION_DISCONNECT,
  ACTION_DELETE,
  COPYACTION_NEW,
  COPYACTION_DISCONNECT,
  COPYACTION_CONVERT,
  COPYACTION_CHANGE,
  STAT_SAVED,
  STAT_PENDING,
  STAT_SENDING,
  STAT_ACTIVE,
  STAT_OLD,
  STAT_INVALID,
  STAT_DISCONNECT,
  STAT_MUSTCHECK,
  STAT_FAILED,
} from '../../constants';

@Component({
  selector: 'app-pointer-admin-data',
  templateUrl: './pointer-admin-data.component.html',
  styleUrls: ['./pointer-admin-data.component.scss']
})
export class PointerAdminDataComponent implements OnInit {
  gConst = {
    ACTION_NONE,
    ACTION_ALL,
    ACTION_CREATE,
    ACTION_UPDATE,
    ACTION_COPY,
    ACTION_TRANSFER,
    ACTION_DISCONNECT,
    ACTION_DELETE,
    COPYACTION_NEW,
    COPYACTION_DISCONNECT,
    COPYACTION_CONVERT,
    COPYACTION_CHANGE,
    STAT_SAVED,
    STAT_PENDING,
    STAT_SENDING,
    STAT_ACTIVE,
    STAT_OLD,
    STAT_INVALID,
    STAT_DISCONNECT,
    STAT_MUSTCHECK,
    STAT_FAILED,
  }
  retrieveCardTitle: string = 'Retrieve';
  bRetrieveCardIconHidden: boolean = false;
  bExpRetrieve: boolean = false;
  inputSearchNum: string = '';
  inputSearchEffDtTm: any = null;
  bRetrieveEnable: boolean = false;
  bContentModified: boolean = false;   // if user action has triggered for any one input field, this state is true
  numParam: string = '';      // the state to use as num parameter for calling retrieve pointer record
  effDtTmParam: string = '';      // the state to use as effective date time parameter for calling retrieve pointer record
  preEffDtTmStat:  string = '';      // the state to save previous eff date time state at changing selection on the eff date time state select field
  modifiedModalVisible: boolean = false;

  resultCardTitle: string = 'Result';
  bExpResult: boolean = false;
  effDtTmStatList: any[] = [];
  selectEffDtTmStat = '';
  bEffDtTmListHidden: boolean = true;
  bEffDtTmDisable: boolean = false;
  action: string = this.gConst.ACTION_NONE;
  inputRespOrg: string = '';
  inputCreateEffDtTm: Date|null = new Date();
  minEffDateTime: Date = new Date();
  inputCreateNow: boolean = false;
  inputPriority: boolean = false;
  inputCustomerId: string = '';
  inputAgent: string = '';
  inputTelco: string = '';
  holdOptions = [
    {name: 'No', value: 'N'},
    {name: 'Yes', value: 'Y'},
  ]
  selectHold = 'N';
  inputEndSub: string = '';
  inputEndSubAddr: string = '';
  inputApproval: string = '';
  inputLastUpDt: string = '';
  inputLastUser: string = '';
  inputPrevUser: string = '';
  inputTmplName: string = '';
  inputSvcOrderNum: string = '';
  inputSuppFormNum: string = '';
  inputContactName: string = '';
  inputContactNumber: string = '';
  inputNotes: string = '';
  inputEndIntDtTm: string|Date|null = null;
  selectReferral = ''
  referralOptions = [
    {name: 'SELECT', value: ''},
    {name: 'No', value: 'N'},
    {name: 'Yes', value: 'Y'},
  ];

  selectedDestNums: any[] = [];
  inputDestNum: string = ''
  inputNumTermLine: string = ''
  status: string = '';      // customer record status
  
  disable: boolean = true;
  bEditEnable: boolean = false;    // Edit button enable status
  bCopyEnable: boolean = false;    // Copy button enable status
  bTransferEnable: boolean = false    // Transfer button enable status
  bDeleteEnable: boolean = false    // Delete button enable status
  bSubmitEnable: boolean = false    // Submit button enable status
  bSaveEnable: boolean = false    // Save button enable status
  bRevertEnable: boolean = false    // Revert button enable status
  bCancelEnable: boolean = false    // Cancel button enable status
  copyAction: string = this.gConst.COPYACTION_CHANGE;

  inputMessage: string = '';       // api call result messages

  num: string = '';      // retrieved num

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private _router: Router,
  ) { }

  ngOnInit(): void {

  }

  handleUppercase = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (input.name != "searchNum") {
      this.bContentModified = true
    }

    input.setSelectionRange(start, end);
  };
  
  onSearchNumber = () => {
    let searchUTCString = ""
    if (this.inputSearchEffDtTm != ""||this.inputSearchEffDtTm != undefined||this.inputSearchEffDtTm != null) {
      let searchCTDtTm = new Date(this.inputSearchEffDtTm)
      searchUTCString = gFunc.fromCTTimeToUTCStr(searchCTDtTm)
    }

    // if any modified, shows the modal asking if really will do
    if (this.bContentModified) {
      this.numParam = this.inputSearchEffDtTm;
      this.effDtTmParam = searchUTCString;
      this.preEffDtTmStat = '';   // sets as empty here
      this.modifiedModalVisible = true
    } else if (this.retrievePointerRecord(this.inputSearchNum, searchUTCString, true)) {
      this.inputMessage = PAD_RETRIEVE_SUCCESSFUL;
    }
  }

  onKeyDownToRetrieve = () => {
    this.onSearchNumber();
  }

  retrievePointerRecord = (num: string, effDtTm: string, isUserAct: boolean = false) => {
    num = num.replace(/\-/g, "")
    if (effDtTm != "NOW")
      effDtTm = effDtTm.replace(/\-/g, "").replace(":", "");

    let params = { num: num, effDtTm: effDtTm, roId: this.store.getCurrentRo(), isUserAct: isUserAct }
    return false;
    // return await this.props.callApi2(RestApi.retrievePtrRec, params).then(async (res) => {
    //   if (res.ok && res.data) {

    //     let data = res.data
    //     if (data.errList != null && data.errList.length) {

    //       let errList = data.errList
    //       let errMsg = gFunc.synthesisErrMsg(errList)
    //       if (data.num == null) {

    //         if (errList[0].errCode === "530001" && data.numStatus != null && data.numStatus === "RESERVED") {
    //           this.setState({createModalVisible: true})
    //           return false

    //         } else {
    //           console.log("Error")
    //           NotificationManager.error("", errMsg)
    //           this.setState({bRetrieveEnable: true})
    //           return false
    //         }

    //       }

    //     }

    //     this.unlockPointerRecord()

    //     await this.reflectDataOnPage(num, res.data)

    //     this.backupStateToLastAction()
    //     return true

    //   } else if (res.data !== undefined && res.data.errList !== undefined && res.data.errList.length) {
    //     NotificationManager.error("", gFunc.synthesisErrMsg(res.data.errList))
    //     this.inputMessage = gFunc.synthesisErrMsg(res.data.errList);
    //     this.bRetrieveEnable = true;
    //     return false

    //   }
    // })
  }

  getEffDtTmStatusOptions = (effDtTmStatList: any[]) => {
    return effDtTmStatList.map(item=>({name: item, value: item}));
  }

  /**
   * this function is called at changing selection of effective date time state select field
   */
   onEffDtTmSelChange = () => {
    let UTCTimeStr = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // if any modified, shows the modal asking if really will do
    if (this.bContentModified) {
      this.numParam = this.num;
      this.effDtTmParam = UTCTimeStr;
      this.preEffDtTmStat = this.selectEffDtTmStat;
      this.modifiedModalVisible = true;
    } else if (this.retrievePointerRecord(this.num, UTCTimeStr, true)) {
      this.inputMessage = PAD_RETRIEVE_SUCCESSFUL;
    }
  }

  /**
 * convert from effective date time state string to UTC date time string
 * @param effDtTmStat
 */
    fromEffDtTmStatToUTCStr = (effDtTmStat: string) => {
    let tempArr = effDtTmStat.split(" ")
    let CTTimeStr = tempArr[0] + " " + tempArr[1] + " " + tempArr[2]
    return gFunc.fromCTStrToUTCStr(CTTimeStr)
  }

  /**
 * retrieves the formatted contact number
 * @param number
 * @returns {*}
 */
  formattedNumber = (number: string) => {
    if (number == null || number.length === 0)
      return ""

    let numList = number.replace(/\ /g, "").split(",")
    for (let i = 0; i < numList.length; i++) {
      let num = numList[i]

      num = num.replace(/\-/g, "")
      if (num.length > 6)
        num = num.substring(0, 3) + "-" + num.substring(3, 6) + "-" + num.substring(6, Math.max(6, num.length))
      else if (num.length > 3)
        num = num.substring(0, 3) + "-" + num.substring(3, num.length)

      numList[i] = num
    }

    return numList.join(",")
  }

  /**
   * go to the TAD page
   * @param tmplName
   */
   gotoTADPage = (tmplName: string) => {
    const cookies = new Cookies();
    cookies.set("tmplName", tmplName);
    cookies.set("effDtTm", "");
    // this._router.navigate(['first'])
    this._router.navigateByUrl('/service/tad');
  }

  onEdit = () => {

  }

  onCopy = () => {
    
  }

  onTransfer = () => {
    
  }

  toggleDelete = () => {
    
  }

  onConvert = () => {
    
  }

  onSubmit = () => {
    
  }

  onSave = () => {
    
  }

  onRevert = () => {
    
  }
  
  toggleCancel = () => {
    
  }

}
