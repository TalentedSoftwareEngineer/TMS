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
  PAGE_NO_PERMISSION_MSG,
  RETRIEVE_CARD_TITLE_PREFIX,
  RESULT_CARD_TITLE_PREFIX1,
  RESULT_CARD_TITLE_PREFIX2,
  ERRLVL_WARNING,
  ERRLVL_ERROR,
  RECORD_PAGE_ACTION_RETRIEVE,
  RECORD_PAGE_ACTION_CREATE,
  TRANSFER_PENDING_MSG,
  COPY_PENDING_MSG,
  DISCONNECT_PENDING_MSG,
  PAD_DELETE_SUCCESSFUL,
  SUBMIT_CMD_SIGN,
  SAVE_CMD_SIGN,
  PAD_UPDATE_SUCCESSFUL,
  PAD_CREATE_SUCCESSFUL,
  PAD_COPY_SUCCESSFUL,
  PAD_DISCONNECT_SUCCESSFUL,
  PAD_TRANSFER_SUCCESSFUL
} from '../../constants';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { tap } from "rxjs/operators";
import {environment} from "../../../../environments/environment";

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
    RETRIEVE_CARD_TITLE_PREFIX,
    RESULT_CARD_TITLE_PREFIX1,
    RESULT_CARD_TITLE_PREFIX2,
    ERRLVL_WARNING,
    ERRLVL_ERROR,
    RECORD_PAGE_ACTION_RETRIEVE,
    RECORD_PAGE_ACTION_CREATE,
    TRANSFER_PENDING_MSG,
    COPY_PENDING_MSG,
    DISCONNECT_PENDING_MSG,
    SUBMIT_CMD_SIGN,
    SAVE_CMD_SIGN,
  }
  retrieveCardTitle: string = 'Retrieve';
  bRetrieveCardIconHidden: boolean = false;
  bExpRetrieve: boolean = true;
  bResultHeaderHidden: boolean  = false;
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
  inputCreateEffDtTm: any = new Date();
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
  lstEffDtTms: any[] = [];
  localServOff: any;
  forServOff: any;
  recVersionId: any;
  lockParam: any;

  copyModalVisible: boolean = false;
  transferModalVisible: boolean = false;
  deleteModalVisible: boolean = false;
  convertModalVisible: boolean = false;
  inputSrcNum: string = '';
  inputSrcEffDtTm: string = '';
  inputTgtNum: string = '';
  inputTgtEffDtTm: any;
  inputCopyNow: boolean = false;
  radioCopyAction: string = '';
  nowDateTime: any = new Date();

  bRevertClicked: boolean = false;

  srcRecVersionId: any;

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
      if(state.user.permissions?.includes(PERMISSIONS.POINT_ADMIN_DATA)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this._router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id, { keepAlive: true }).subscribe(data => {
      this.inputMessage = data.title + data.message + '<br><br>' + this.inputMessage;
    })

    this.initialDataLoading();
  }

  initialDataLoading = async () => {
    const cookies = new Cookies();

    let num = cookies.get("ptrNum");
    let effDtTm = cookies.get("ptrEffDtTm");
    let action = cookies.get("action");

    if (action) {
      switch (action) {
        case this.gConst.RECORD_PAGE_ACTION_RETRIEVE:
          if (effDtTm) {
            let localDtTm = new Date(effDtTm)
            this.inputSearchNum = num;
            this.inputSearchEffDtTm = localDtTm/*.getTime()*/
            this.bRetrieveEnable = false;
          } else {
            this.inputSearchNum = num
            this.bRetrieveEnable = false
          }

          if (await this.retrievePointerRecord(num, effDtTm, true)) {
            this.inputMessage = PAD_RETRIEVE_SUCCESSFUL
          }
          break;
        case this.gConst.RECORD_PAGE_ACTION_CREATE:
          this.action = this.gConst.ACTION_CREATE;
          this.disable = false;
          this.num = num;
          this.retrieveCardTitle = "Create a New Pointer Record: " + gFunc.formattedNumber(num);
          this.bRetrieveCardIconHidden = true;
          this.bResultHeaderHidden = true;
          this.bExpRetrieve = false;
          this.bExpResult = true;

          this.bEditEnable = false;
          this.bCopyEnable = false;
          this.bTransferEnable = false;
          this.bDeleteEnable = false;
          break;
      }

      cookies.remove("ptrNum");
      cookies.remove("ptrEffDtTm");
      cookies.remove("action");
    }
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

  onSearchNumber = async () => {
    let searchUTCString = ""
    if (Boolean(this.inputSearchEffDtTm)) {
      let searchCTDtTm = new Date(this.inputSearchEffDtTm)
      searchUTCString = gFunc.fromCTTimeToUTCStr(searchCTDtTm)
    }

    // if any modified, shows the modal asking if really will do
    if (this.bContentModified) {
      this.numParam = this.inputSearchEffDtTm;
      this.effDtTmParam = searchUTCString;
      this.preEffDtTmStat = '';   // sets as empty here
      this.modifiedModalVisible = true
    } else if (await this.retrievePointerRecord(this.inputSearchNum.replace(/\W/g, ''), searchUTCString, true)) {
      this.inputMessage = PAD_RETRIEVE_SUCCESSFUL;
    }
  }

  onKeyDownToRetrieve = () => {
    this.onSearchNumber();
  }

  retrievePointerRecord = async (num: string, effDtTm: string, isUserAct: boolean = false): Promise<boolean> => {
    num = num.replace(/\-/g, "")
    if (effDtTm != "NOW")
      effDtTm = effDtTm?.replace(/\-/g, "").replace(":", "");

    let params = { num: num, effDtTm: effDtTm, ro: this.store.getCurrentRo(), isUserAct: isUserAct }
    let res: any = await new Promise<any>(resolve=> {
      this.api.retrievePtrRec(this.store.getCurrentRo(), num, effDtTm).subscribe(res=>{resolve(res)});
    });

    if (res) {
      let data = res
      if (data.errList != null && data.errList.length) {
        let errList = data.errList
        let errMsg = gFunc.synthesisErrMsg(errList)
        if (data.num == null) {
          if (errList[0].errCode === "530001" && data.numStatus != null && data.numStatus === "RESERVED") {
            this.confirmationService.confirm({
              message: 'Do you want to create a new Pointer Record?',
              header: 'Confirmation',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                this.createAction();
              },
              reject: (type: any) => {
                switch(type) {
                  case ConfirmEventType.REJECT:
                    break;
                  case ConfirmEventType.CANCEL:
                    break;
                }
              }
            });
            return false
          } else {
            this.showError(errMsg, 'Error');
            this.bRetrieveEnable = true
            return false
          }
        }
      }
      this.unlockPointerRecord()
      await this.reflectDataOnPage(num, res)
      // this.backupStateToLastAction()
      return true
    }

    if (res !== undefined && res.errList !== undefined && res.errList.length) {
      this.showError(gFunc.synthesisErrMsg(res.errList), 'Error');
      this.inputMessage = gFunc.synthesisErrMsg(res.errList)
      this.bRetrieveEnable = true
      return false;
    }

    return false;
  }

  reflectDataOnPage = async (num: string, data: any) => {
    let effDtTm = data.effDtTm
    // gets the list of effective date time
    let lstEffDtTms = data.lstEffDtTms

    // if no result, shows the message if moves to create mode
    if (lstEffDtTms == undefined || lstEffDtTms == null) {
      this.confirmationService.confirm({
        message: 'Do you want to create a new Pointer Record?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.createAction();
        },
        reject: (type: any) => {
            switch(type) {
                case ConfirmEventType.REJECT:
                  break;
                case ConfirmEventType.CANCEL:
                  break;
            }
        }
      });
      return
    }

    // effective date time status list
    let nEffIndex = 0
    let dtTmStatList = []

    for (let i = 0; i < lstEffDtTms.length; i++) {

      let edt = lstEffDtTms[i]
      let dtTmString = gFunc.fromUTCStrToCTStr(edt.effDtTm)
      let dtTmStat = dtTmString + " CT " + edt.custRecStat.replace("_", " ") + " " + edt.custRecCompPart.substring(0, 3)
      dtTmStatList.push(dtTmStat)

      if (effDtTm === edt.effDtTm) {
        nEffIndex = i;
      }
    }

    // if the record was activated by CAD, go to the PAD page
    if (lstEffDtTms[nEffIndex].custRecCompPart.includes("CAD")) {
      this.gotoCADPage(num, effDtTm)
      return
    }

    let status = lstEffDtTms[nEffIndex].custRecStat.replace("_", " ")

    this.num = num;
    this.retrieveCardTitle = this.gConst.RETRIEVE_CARD_TITLE_PREFIX + ": " + gFunc.formattedNumber(num);
    this.bRetrieveCardIconHidden = true;
    this.resultCardTitle = this.gConst.RESULT_CARD_TITLE_PREFIX2;
    this.bResultHeaderHidden = false;
    this.bEffDtTmListHidden = false;
    this.bExpRetrieve = false;
    this.bExpResult = true;
    this.effDtTmStatList = dtTmStatList;
    this.selectEffDtTmStat = dtTmStatList[nEffIndex];
    this.lstEffDtTms = lstEffDtTms;
    this.status = status;

    // this.props.selectRo(data.ctrlRespOrgId)

    // set the prev user and last user
    let lastUsr = '', prevUsr = '', lastUpDt = ''
    if (data.lastUsr != null)
      lastUsr = data.lastUsr
    if (data.prevUsr != null)
      prevUsr = data.prevUsr
    if (data.lastUpDt != null && data.lastUpDt != '')
      lastUpDt = gFunc.fromUTCStrToCTStr(data.lastUpDt)

    let destNum = '', numTermLine = '', forServOff = '', localServOff = ''
    if (data.destNums != null && data.destNums.length > 0) {
      if (data.destNums[0].destNum != null) destNum = gFunc.formattedNumber(data.destNums[0].destNum)
      if (data.destNums[0].numTermLine != null) numTermLine = data.destNums[0].numTermLine
      if (data.destNums[0].forServOff != null) forServOff = data.destNums[0].forServOff
      if (data.destNums[0].localServOff != null) localServOff = data.destNums[0].localServOff
    }

    // console.log("destNums: " + JSON.stringify(data.destNums))
    // console.log("destNums: " + destNum + ", " + numTermLine + ", " + forServOff + ", " + localServOff)

    this.inputRespOrg = data.ctrlRespOrgId;
    this.inputPriority = (data.priority == 'Y');
    this.inputCustomerId = data.onAccCust ? data.onAccCust : '';

    this.inputAgent = data.agent ? data.agent : '';
    this.inputTelco = data.telco ? data.telco : '';
    this.selectHold = data.hldIndFlag ? data.hldIndFlag : 'N';

    this.inputEndSub = data.endSub ? data.endSub : '';
    this.inputEndSubAddr = data.endSubAddr ? data.endSubAddr : '';
    this.inputSvcOrderNum = data.svcOrderNum ? data.svcOrderNum : '';
    this.inputSuppFormNum = data.suppFormNum ? data.suppFormNum : '';

    this.inputApproval = data.lstEffDtTms[nEffIndex].apprStat.replace(/\_/g, " ");
    this.inputLastUpDt = lastUpDt;
    this.inputLastUser = lastUsr;
    this.inputPrevUser = prevUsr;

    this.inputTmplName = data.tmplName;

    this.inputDestNum = destNum;
    this.inputNumTermLine = numTermLine;
    this.localServOff = localServOff;
    this.forServOff = forServOff;

    this.inputContactName = data.conName ? data.conName : '';
    this.inputContactNumber = data.conTel ? gFunc.formattedNumber(data.conTel) : '';
    this.inputNotes = data.notes ? data.notes : '';

    this.inputEndIntDtTm = data.endInterceptDt ? data.endInterceptDt : '';
    // endIntDtTm:   data.endInterceptDt ? this.fromUTCStrToCTVal(data.endInterceptDt) : '',
    this.selectReferral = data.referral ? data.referral : '';

    this.recVersionId = data.recVersionId;

    // check if the user has permission for the customer record
    if (data.errList != null && data.errList.length) {

      let errList = data.errList
      let errMsg = gFunc.synthesisErrMsg(errList)

      if (errList[0].errLvl === this.gConst.ERRLVL_WARNING)
        this.showWarn(errMsg);
      else
        this.showError(errMsg, "Error");

      if (data.errList[0].errLvl === this.gConst.ERRLVL_ERROR) {  // no error
        this.disable = true;
        this.bContentModified = false;
        this.bRetrieveEnable = true;
        this.bEditEnable = false;
        this.bCopyEnable = false;
        this.bTransferEnable = false;
        this.bDeleteEnable = false;
        this.bSubmitEnable = false;
        this.bSaveEnable = false;
        this.bRevertEnable = false;
        this.bCancelEnable = true;

        this.bEffDtTmDisable = false;

        return
      }
    }

    // if current date is before than the the date of selected template record
    let ctEffDtTmStr = this.getCurEffDtTm()
    let localEffDtTm = gFunc.fromCTStrToLocalTime(ctEffDtTmStr)
    let curTime = new Date()

    if (localEffDtTm >= curTime) {
      this.bEditEnable = true;
      this.bDeleteEnable = true;
    } else {
      this.bEditEnable = false;
      this.bDeleteEnable = false;
    }

    let bTransferEnable = true
    if (status === this.gConst.STAT_ACTIVE || status === this.gConst.STAT_OLD
      || status === this.gConst.STAT_SENDING || status === this.gConst.STAT_DISCONNECT) {
      bTransferEnable = false
    }

    let bCopyEnable = true
    if (status === this.gConst.STAT_OLD || status === this.gConst.STAT_FAILED)
      bCopyEnable = false

    let bSubmitEnable = false
    if (status === this.gConst.STAT_SAVED)
      bSubmitEnable = true

      this.disable = true;
      this.bContentModified = false;
      this.bRetrieveEnable = true;
      this.bCopyEnable = bCopyEnable;
      this.bTransferEnable = bTransferEnable;
      this.bSubmitEnable = bSubmitEnable;
      this.bSaveEnable = false;
      this.bRevertEnable = false;
      this.bCancelEnable = true;

      this.bEffDtTmDisable = false;
  }

  gotoCADPage = (num: string, effDtTm: string) => {
    const cookies = new Cookies();
    cookies.set("cusNum", num);
    cookies.set("cusEffDtTm", effDtTm);
    cookies.set("action", this.gConst.RECORD_PAGE_ACTION_RETRIEVE)
    this._router.navigateByUrl(ROUTES.customerAdmin.cad)
  }

  getCurEffDtTm = () => {
    let tempArr = this.selectEffDtTmStat.split(" ")
    return tempArr[0] + " " + tempArr[1] + " " + tempArr[2]
  }

  getEffDtTmStatusOptions = (effDtTmStatList: any[]) => {
    return effDtTmStatList.map(item=>({name: item, value: item}));
  }

  /**
   * this function is called at changing selection of effective date time state select field
   */
   onEffDtTmSelChange = async () => {
    let UTCTimeStr = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // if any modified, shows the modal asking if really will do
    if (this.bContentModified) {
      this.numParam = this.num;
      this.effDtTmParam = UTCTimeStr;
      this.preEffDtTmStat = this.selectEffDtTmStat;
      this.modifiedModalVisible = true;
    } else if (await this.retrievePointerRecord(this.num, UTCTimeStr, true)) {
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
    let UTCTimeStr = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    let body = { ptrRecAction: this.gConst.ACTION_UPDATE, srcNum: this.num, srcEffDtTm: UTCTimeStr }
    this.api.lockPtrRec({'body': JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res => {
      if (res) {
        if (res.updateStatus.isAllowed === 'Y') {
          this.lockParam = body
          this.disable = false;
          this.bEditEnable = false;
          this.bSubmitEnable = true
          this.bSaveEnable = true;
          return
        }
      }

      if (res && res.updateStatus && res.updateStatus.statusMessages !== null) {
        this.inputMessage = gFunc.synthesisErrMsg(res.updateStatus.statusMessages)
      }
    })
  }

  onCopy = () => {
    this.inputSrcNum = this.num;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtNum = gFunc.formattedNumber(this.num);
    this.inputTgtEffDtTm = '';
    this.inputCopyNow = false;
    this.copyAction = this.gConst.COPYACTION_CHANGE;
    this.copyModalVisible = true;
  }

  checkValidForCopying = async () => {
    if (!this.inputCopyNow && !Boolean(this.inputTgtEffDtTm)) {
      this.showInfo("Please input effective date/time");
      return
    }

    let tgtNum = this.inputTgtNum.replace(/\-/g, "")

    switch (this.radioCopyAction) {
      case this.gConst.COPYACTION_CHANGE:
        break
      case this.gConst.COPYACTION_DISCONNECT:
        if (this.inputSrcNum !== tgtNum) {
          this.showInfo("Copy of a Disconnect TR is allowed only to the same Number");
          return
        }
        break
      case this.gConst.COPYACTION_NEW:
        if (this.inputSrcNum === tgtNum) {
          this.showInfo("Action must be Change or Disconnect");
          return
        }
        break
    }

    // gets source date time
    let srcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      let d = new Date(this.inputTgtEffDtTm).getTime();
      tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z';     
    }

    let ptrRecAction = this.gConst.ACTION_COPY
    if (this.radioCopyAction === this.gConst.COPYACTION_DISCONNECT || this.selectReferral !== '') {
      ptrRecAction = this.gConst.ACTION_DISCONNECT
    }

    // configs parameter for calling lock api
    let body = {
      ptrRecAction: ptrRecAction,
      srcNum: this.inputSrcNum,
      srcEffDtTm: srcEffDtTm,
      tgtNum: tgtNum,
      tgtEffDtTm: tgtEffDtTm,
    }

    // calls lock api
    let res = await new Promise<any>(resolve=>{
      this.api.lockPtrRec({body: JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=>{
        resolve(res);
      });
    });
  
    if (res) {
      if ((res.copyStatus && res.copyStatus.isAllowed === 'Y')
        || (res.disconnectStatus && res.disconnectStatus.isAllowed === 'Y')) {

        this.srcRecVersionId = this.recVersionId
        this.lockParam = body;

        let effDtTmStat = "NOW"
        if (body.tgtEffDtTm != "NOW")
          effDtTmStat = gFunc.fromUTCStrToCTStr(body.tgtEffDtTm)
        let effDtTmStatList = [effDtTmStat]

        // if create
        if (body.srcNum !== body.tgtNum) {
          this.retrieveCardTitle = "Create a New Pointer Record: " + gFunc.formattedNumber(body.tgtNum)
        }

        this.effDtTmStatList = effDtTmStatList
        this.selectEffDtTmStat = effDtTmStat
        this.num = body.tgtNum

        this.finishCpyTrnsfrOp()

        return
      }
    }
  }

  onTransfer = () => {
    this.inputSrcNum = this.num;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtNum = gFunc.formattedNumber(this.num);
    this.inputTgtEffDtTm = '';
    this.inputCopyNow = false;
    this.transferModalVisible = true;
  }

  checkValidForTransferring = async () => {
    // gets source date time
    let srcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      if (!Boolean(this.inputTgtEffDtTm)) {
        this.showInfo('Please input effective date/time');
        return
      }
      let d = new Date(this.inputTgtEffDtTm).getTime();
      tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    let tgtNum = this.inputTgtNum.replace(/\-/g, "")

    // configs parameter for calling lock api
    let body = {
      ptrRecAction: this.gConst.ACTION_TRANSFER,
      srcNum: this.inputSrcNum,
      srcEffDtTm: srcEffDtTm,
      tgtNum: tgtNum,
      tgtEffDtTm: tgtEffDtTm,
    }

    // calls lock api
    let res = await new Promise<any>(resolve=>{
      this.api.lockPtrRec({'body': JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=> {
        resolve(res);
      });
    });
    
    if (res) {
      if (res.transferStatus.isAllowed === 'Y') {
        this.srcRecVersionId = this.recVersionId
        this.lockParam = body

        let effDtTmStat = "NOW"
        if (body.tgtEffDtTm != "NOW")
          effDtTmStat = gFunc.fromUTCStrToCTStr(body.tgtEffDtTm)
        let effDtTmStatList = [effDtTmStat]

        this.effDtTmStatList = effDtTmStatList;
        this.selectEffDtTmStat = effDtTmStat;

        this.finishCpyTrnsfrOp()
        return
      }
    }
  }

  toggleDelete = () => {
    this.deleteModalVisible = false;
  }

  deletePointerRecord = async () => {
    this.toggleDelete()

    let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)  // YYYY-MM-DDTHH:mmZ

    let params = { num: this.num, effDtTm: utcEffDtTm, recVersionId: this.recVersionId, ro: this.store.getCurrentRo()}
    this.api.deletePtrRec(params).subscribe(res => {
      if (res) {
        this.showSuccess(PAD_DELETE_SUCCESSFUL);
        this.inputMessage = ''

        let effDtTmListSize = this.effDtTmStatList.length

        if (this.effDtTmStatList.length == 1) { // only one record, goes to initial state of page
          this.cancelAction()
        } else { // if next record exists, shows next record, else shows previous record

          this.clearAllData()

          // gets index
          let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)

          let effDtTmStatList = [...this.effDtTmStatList]
          effDtTmStatList.splice(index, 1)
          effDtTmStatList.splice(0, 0, "SELECT")

          this.effDtTmStatList = effDtTmStatList
          this.selectEffDtTmStat = "SELECT";
          this.bEditEnable = false;
          this.bCopyEnable = false;
          this.bTransferEnable = false;
          this.bDeleteEnable = false;
          this.bSubmitEnable = false;
          this.bSaveEnable = false;
          this.bRevertEnable = false;
          this.bCancelEnable = true;
        }
      }
    })
  }

  cancelAction = async () => {
    await this.unlockPointerRecord()
    this.inputSearchNum = '';
    // this.inputSearchEffDtTm = null
    // this.bExpRetrieve = true;
    // this.bExpResult = false;

    this.inputSearchEffDtTm = '';
    this.bRetrieveEnable = true;
    this.bExpRetrieve = true;
    this.bExpResult = false;
    this.bEffDtTmListHidden = true;
    this.selectEffDtTmStat = '';
    this.resultCardTitle = 'Result'
  };

  unlockPointerRecord = () => {
    let lockParam = this.lockParam

    if (lockParam && lockParam.ptrRecAction) {
      let body: any = {}

      switch (lockParam.ptrRecAction) {
        case this.gConst.ACTION_COPY:
        case this.gConst.ACTION_TRANSFER:
        case this.gConst.ACTION_DISCONNECT:
          body.num = lockParam.tgtNum
          body.effDtTm = lockParam.tgtEffDtTm
          break

        case this.gConst.ACTION_UPDATE:
          body.num = lockParam.srcNum
          body.effDtTm = lockParam.srcEffDtTm
          break
      }
      console.log("body: " + JSON.stringify(body))

      this.api.unlockPtrRec({'body': JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe((res: any) => { })
    }
  }

  onConvert = () => {
    this.inputSrcNum = this.num;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtNum = gFunc.formattedNumber(this.num);
    this.inputTgtEffDtTm = '';
    this.inputCopyNow = false;
    this.copyAction = this.gConst.COPYACTION_CONVERT;
    this.convertModalVisible = true;
  }

  checkValidForConverting = async () => {

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      if (!Boolean(this.inputTgtEffDtTm)) {
        this.showInfo('Please input effective date/time');
        return
      }
      let d = new Date(this.inputTgtEffDtTm).getTime();
      tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }


    for (let effDtTmStat of this.effDtTmStatList) {
      let utcEffDtTm = this.fromEffDtTmStatToUTCStr(effDtTmStat)
      if (utcEffDtTm === tgtEffDtTm) {
        this.confirmationService.confirm({
          message: 'Target record exists. Do you want to overwrite?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.convertPointerRecord()
          },
          reject: (type: any) => {
              switch(type) {
                  case ConfirmEventType.REJECT:
                    break;
                  case ConfirmEventType.CANCEL:
                    break;
              }
          }
        });
        return
      }
    }

    this.convertPointerRecord()
  }

  convertPointerRecord = async () => {
    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      let d = new Date(this.inputTgtEffDtTm).getTime();
      tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    // configs parameter for calling lock api
    let body = {
      recVersionId: this.recVersionId,
      tfNum: this.inputSrcNum,
      srcEffDtTm: gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm),
      tgtEffDtTm: tgtEffDtTm,
    }

    // calls lock api
    let res: any = await new Promise<any>(resolve=>{
      this.api.convertPtrRec({body: JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=> {
        resolve(res);
      });
    });

    if (res) {
      if (res.effDtTm) {
        this.gotoCADPage(this.inputSrcNum, res.effDtTm)
        return

      } else if (res.reqId) {
        let params = {reqId: res.reqId, ro: this.store.getCurrentRo()}
        await this.api.resultOfConvertedPtrRec(params).pipe(tap(resResult => {
          if (resResult) {
            this.gotoCADPage(this.inputSrcNum, resResult.effDtTm)
            return
          }
          return
        })).toPromise();
      }
    }
  }

  onSubmit = () => {
    this.performAction(this.gConst.SUBMIT_CMD_SIGN)
  }

  onSave = () => {
    this.performAction(this.gConst.SAVE_CMD_SIGN)
  }

  performAction = (cmd: string) => {
    switch (this.action) {
      case this.gConst.ACTION_NONE:
        this.updatePointerRecord(cmd)
        break
      case this.gConst.ACTION_CREATE:
        this.createPointerRecord(cmd)
        break
      case this.gConst.ACTION_COPY:
        if (this.selectReferral === '')
          this.copyPointerRecord(cmd)
        else
          this.disconnectPointerRecord(cmd)
        break
      case this.gConst.ACTION_TRANSFER:
        this.transferPointerRecord(cmd)
        break
      case this.gConst.ACTION_DISCONNECT:
        if (this.selectReferral === '') {
          this.inputMessage = 'Please select referral data'
          return
        }
        this.disconnectPointerRecord(cmd)
        break
    }
  }

  checkValidation = () => {
    let message = ''

    if (this.inputRespOrg === '') {
      message += 'Resp Org field is required.'
    }

    if (this.inputNumTermLine === '') {
      message += (message === '') ? '' : '\r\n'
      message += 'Number of Lines field is required.'
    }

    if (message != '') {
      this.inputMessage = message
      return false
    }
    return true
  }

  getCommonRequestBody = (cmd: string) => {
    let destNums = []
    let destination: any = {}
    if (this.inputDestNum !== '')        destination.destNum = this.inputDestNum.replace(/\-/g, '')
    if (this.inputNumTermLine !== '')    destination.numTermLine = this.inputNumTermLine
    if (this.forServOff !== '')     destination.forServOff = this.forServOff
    if (this.localServOff !== '')   destination.localServOff = this.localServOff

    destNums.push(destination)

    let body: any = {
      cmd: cmd,
      priority: this.inputPriority ? 'Y' : 'N',
      telco: this.inputTelco,
      hldIndFlag: this.selectHold,
      tmplName: this.inputTmplName,
      destNums: destNums,
    }

    // if (this.customerId !== '')
    //   body.onAccCust = this.customerId
    //
    // if (this.agent !== '')
    //   body.agent = this.agent

    if (this.inputEndSub !== '')
      body.endSub = this.inputEndSub

    if (this.inputEndSubAddr !== '')
      body.endSubAddr = this.inputEndSubAddr

    if (this.inputSvcOrderNum !== '')
      body.svcOrderNum = this.inputSvcOrderNum

    if (this.inputSuppFormNum !== '')
      body.suppFormNum = this.inputSuppFormNum

    if (this.inputContactName !== '')
      body.conName = this.inputContactName

    if (this.inputContactNumber !== '')
      body.conTel = this.inputContactNumber.replace(/\-/g, "")

    if (this.inputNotes !== '')
      body.notes = this.inputNotes
    return body
  }

  getUpdateRequestBody = async (cmd: string) => {

    let body = await this.getCommonRequestBody(cmd)

    body.num = this.num
    body.effDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    if (Boolean(this.inputEndIntDtTm))
      body.endInterceptDt = this.inputEndIntDtTm

    if (this.selectReferral != null && this.selectReferral !== '')
      body.referral = this.selectReferral

    body.recVersionId = this.recVersionId
    return body
  }

  getCreateRequestBody = async (cmd: string) => {
    let body = await this.getCommonRequestBody(cmd)
    body.num = this.num

    let effDtTm = "NOW"
    if (!this.inputCreateNow)
      effDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputCreateEffDtTm))
    body.effDtTm = effDtTm

    body.newRespOrgId = this.inputRespOrg
    return body
  }

  getCopyRequestBody = async (cmd: string) => {
    let body = await this.getCommonRequestBody(cmd)

    body.srcNum = this.inputSrcNum
    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)

    body.tgtNum = this.inputTgtNum.replace(/\-/g, "")
    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    body.ctrlRespOrgId = this.inputRespOrg
    body.custRecCompPart = 'PAD'
    body.recVersionId = this.recVersionId
    return body
  }

  getDisconnectRequestBody = async (cmd: string) => {

    let body = await this.getCommonRequestBody(cmd)

    body.num = this.num
    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)

    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    body.ctrlRespOrgId = this.inputRespOrg
    body.endInterceptDt = this.inputEndIntDtTm
    body.referral = this.selectReferral
    body.custRecCompPart = 'PAD'
    body.recVersionId = this.recVersionId
    return body
  }

  getTransferRequestBody = async (cmd: string) => {
    let body = await this.getCommonRequestBody(cmd)

    body.num = this.inputSrcNum
    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)

    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    body.ctrlRespOrgId = this.inputRespOrg
    if (this.inputEndIntDtTm != null && this.inputEndIntDtTm !== '')
      body.endInterceptDt = this.inputEndIntDtTm

    if (this.selectReferral != null && this.selectReferral !== '')
      body.referral = this.selectReferral

    body.custRecCompPart = 'PAD'
    body.recVersionId = this.recVersionId
    return body
  }

  updatePointerRecord = async (cmd: string) => {
    if (!this.checkValidation()) {
      return false
    }

    let body = await this.getUpdateRequestBody(cmd)

    let res: any = await new Promise<any>((resolve, reject)=> {
      this.api.updatePtrRec({'body': JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=>{
        resolve(res)
      }, err=>{
        reject(false);
      })
    });
    
    if (res) {
      let data = res
      if (data.recVersionId !== undefined && data.recVersionId != null) {
        this.recVersionId = data.recVersionId
      }

      if (await this.retrievePointerRecord(body.num, body.effDtTm)) {
        this.showSuccess(PAD_UPDATE_SUCCESSFUL);
        this.inputMessage = PAD_UPDATE_SUCCESSFUL
      }
    } else {
      return false;
    }
    return true
  }

  createPointerRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }

    let body: any = await this.getCreateRequestBody(cmd)

    let res = await new Promise<any>((resolve, reject)=> {
      this.api.createPtrRec({'body': JSON.stringify(body), ro: this.inputRespOrg}).subscribe(res=>{
        resolve(res);
      }, err=> {
        reject(false);
      });
    });
    
    if (res) {
      let data = res
      if (data.recVersionId != undefined && data.recVersionId != null) {
        this.recVersionId = data.recVersionId
      }

      if (await this.retrievePointerRecord(body.num, data.effDtTm)) {
        this.showSuccess(PAD_CREATE_SUCCESSFUL)
        this.inputMessage = ''
        this.action = this.gConst.ACTION_NONE
      }
    } else {
      return false
    }

    return true;
  };

  copyPointerRecord = async (cmd: string) => {
    let body = await this.getCopyRequestBody(cmd)

    let res: any = await new Promise<any>((resolve, reject)=>{
      this.api.copyPtrRec({body: JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=>{
        resolve(res);
      }, err => {
        reject(false)
      });
    });
    
    if (res) {
      let data = res
      if (data.recVersionId != undefined && data.recVersionId != null) {
        recVersionId: data.recVersionId
      }

      if (await this.retrievePointerRecord(body.tgtNum, res.effDtTm)) {
        this.showSuccess(PAD_COPY_SUCCESSFUL)
        this.inputMessage = PAD_COPY_SUCCESSFUL
        this.action = this.gConst.ACTION_NONE
      }
    } else if (res != undefined) {
      return false
    }
    return true
  }

  disconnectPointerRecord = async (cmd: string) => {
    let body = await this.getDisconnectRequestBody(cmd)

    let res = await new Promise<any>((resolve, reject)=>{
      this.api.disconnectPtrRec({'body': JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=>{
        resolve(res)
      }, err=>{
        reject(err)
      });
    });
    
    if (res) {
      let data = res
      if (data.recVersionId !== undefined && data.recVersionId != null) {
        this.recVersionId = data.recVersionId;
      }

      if (await this.retrievePointerRecord(body.num, res.effDtTm)) {
        this.showSuccess(PAD_DISCONNECT_SUCCESSFUL);
        this.inputMessage = PAD_DISCONNECT_SUCCESSFUL
        this.action = this.gConst.ACTION_NONE
      }

    } else {
      return false
    }
    return true
  }

  transferPointerRecord = async (cmd: string) => {
    let body = await this.getTransferRequestBody(cmd)

    let res = await new Promise<any>((resolve, reject)=>{
      this.api.transferPtrRec({body: JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=>{
        resolve(res);
      }, err => {
        reject(false)
      });
    });
    
    if (res) {
      let data = res
      if (data.recVersionId !== undefined && data.recVersionId != null) {
        this.recVersionId = data.recVersionId
      }

      if (await this.retrievePointerRecord(body.num, res.effDtTm)) {
        this.showSuccess(PAD_TRANSFER_SUCCESSFUL);
        this.inputMessage = PAD_TRANSFER_SUCCESSFUL
        this.action = this.gConst.ACTION_NONE
      }
    } else {
      return false
    }
    return true
  }

  onRevert = () => {
    this.bRevertClicked = true
    this.confirmationService.confirm({
      message: 'The data that you modified will be lost. Are you sure you wish to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.bRevertClicked)
          this.doRevert()
        else
          this.doAnotherPtr()
      },
      reject: (type: any) => {
          switch(type) {
              case ConfirmEventType.REJECT:
                if (this.bRevertClicked)
                  this.cancelRevert()
                else
                  this.cancelAnotherPtr()
                break;
              case ConfirmEventType.CANCEL:
                break;
          }
      }
    });
  }

  doRevert = () => {
    // this.setState(JSON.parse(JSON.stringify(this.lastActionState)));
    this.bEditEnable = false;
    this.disable = false;
  }

  doAnotherPtr = async () => {
    if (await this.retrievePointerRecord(this.numParam, this.effDtTmParam, true)) {
      this.inputMessage = PAD_RETRIEVE_SUCCESSFUL;
    }
  };

  cancelRevert = () => {
    this.bRevertClicked = false;
  }

  cancelAnotherPtr = () => {
    if (this.preEffDtTmStat != '')
    this.selectEffDtTmStat = this.preEffDtTmStat
  };

  toggleCancel = () => {
    this.confirmationService.confirm({
      message: 'Are you sure you wish to cancel?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cancelAction()
      },
      reject: (type: any) => {
          switch(type) {
              case ConfirmEventType.REJECT:
                break;
              case ConfirmEventType.CANCEL:
                break;
          }
      }
    });
  }

  createAction = async () => {
    // lock the number
    let body = { ptrRecAction: this.gConst.ACTION_ALL, srcNum: this.inputSearchNum.replace(/\W/g, '') }
    let res: any = await new Promise<any>(resolve=>{
      this.api.lockPtrRec({'body': JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res=>{
        resolve(res);
      });
    });
    
    if (res) {
      if (res.createStatus.isAllowed === 'N') {
        this.bRetrieveEnable = true
        if (res.createStatus.statusMessages)
          this.showError(res.createStatus.statusMessages[0].errMsg, '');
        return
      }
    }

    let retrieveCardTitle = "Create a New Pointer Record: " + gFunc.formattedNumber(this.inputSearchNum)
    this.action = this.gConst.ACTION_CREATE;
    this.disable = false;
    this.num = this.inputSearchNum.replace(/\W/g, '');
    this.retrieveCardTitle = retrieveCardTitle;
    this.bRetrieveCardIconHidden = true;
    this.bResultHeaderHidden = true;
    this.bExpRetrieve = false;
    this.bExpResult = true;

    this.bEditEnable = false;
    this.bCopyEnable = false;
    this.bTransferEnable = false;
    this.bDeleteEnable = false;

    this.clearAllData()

    // get user information from the server and set the mail.
    this.inputContactName = this.store.getContactInformation().name;
    this.inputContactNumber = this.store.getContactInformation().number;
  };

  clearAllData = async () => {
    this.inputCreateEffDtTm = null;       // effective date time value for creating
    this.inputCreateNow = false;    // now check value

    this.inputRespOrg = '';       // resp organization
    this.inputPriority = false;    // high priority
    this.inputCustomerId = '';       // customer id

    this.inputAgent = '';       // agent
    this.inputTelco = '';       // telco
    this.selectHold = '';    // the flag if holding

    this.inputEndSub = '';       // end subscriber name
    this.inputEndSubAddr = '';       // end subscriber address
    this.inputSvcOrderNum = '';       // service order num
    this.inputSuppFormNum = '';       // support form num

    this.inputLastUpDt = '';       // the date time of last changed
    this.inputApproval = '';       // approval
    this.inputLastUser = '';       // last user
    this.inputPrevUser = '';       // prev user

    this.inputTmplName = '';        // template name

    this.inputDestNum = '';
    this.inputNumTermLine = '';
    this.localServOff = '';
    this.forServOff = '';

    this.inputContactName = '';       // contact name
    this.inputContactNumber = '';       // contact telephone
    this.inputNotes = '';       // notes

    this.inputEndIntDtTm = '';       // end intercept date time
    this.selectReferral = '';       // referral

    this.inputMessage = '';
  }

  finishCpyTrnsfrOp = () => {
    let action = this.gConst.ACTION_TRANSFER
    let message = this.gConst.TRANSFER_PENDING_MSG
    switch (this.lockParam.ptrRecAction) {
      case this.gConst.ACTION_COPY:
        action = this.gConst.ACTION_COPY
        message = this.gConst.COPY_PENDING_MSG
        break
      case this.gConst.ACTION_TRANSFER:
        action = this.gConst.ACTION_TRANSFER
        message = this.gConst.TRANSFER_PENDING_MSG
        break
      case this.gConst.ACTION_DISCONNECT:
        action = this.gConst.ACTION_DISCONNECT
        message = this.gConst.DISCONNECT_PENDING_MSG
        break
    }

    this.bEffDtTmDisable = true;

    this.disable = false;

    this.bEditEnable = false;
    this.bCopyEnable = false;
    this.bTransferEnable = false;
    this.bDeleteEnable = false;

    this.bSubmitEnable = true;
    this.bSaveEnable = true;
    this.bRevertEnable = false;

    this.action = action;
    this.inputMessage = message;

    this.copyModalVisible = false;
    this.transferModalVisible = false;

    this.showSuccess(message);
  }

  gFuncFormattedNumber = (num: string) => {
    gFunc.formattedNumber(num);
  }

  onSearchEffDtTmIntervalFifteenMin = () => {
    let d = new Date(this.inputSearchEffDtTm).getTime();
    this.inputSearchEffDtTm = new Date(Math.ceil(d / 900000) * 900000);
  }

  onCreateEffDtTmIntervalFifteenMin = () => {
    let d = new Date(this.inputCreateEffDtTm).getTime();
    this.inputCreateEffDtTm = new Date(Math.ceil(d / 900000) * 900000);
  }

  onTgtEffDtTmIntervalFifteenMin = () => {
    let d = new Date(this.inputTgtEffDtTm).getTime();
    this.inputTgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000);
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
