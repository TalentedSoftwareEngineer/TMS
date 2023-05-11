import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ACTION_NONE,
  ACTION_ALL,
  ACTION_CREATE,
  ACTION_UPDATE,
  ACTION_COPY,
  ACTION_TRANSFER,
  ACTION_DISCONNECT,
  ACTION_DELETE,
  CARRIER_LIST,
  COPYACTION_CHANGE,
  COPYACTION_CONVERT,
  COPYACTION_DISCONNECT,
  COPYACTION_NEW,
  STAT_SAVED,
  STAT_PENDING,
  STAT_SENDING,
  STAT_ACTIVE,
  STAT_OLD,
  STAT_INVALID,
  STAT_DISCONNECT,
  STAT_MUSTCHECK,
  STAT_FAILED,
  AOS_NETWORK_MODAL_HEADER_TITLE,
  AOS_STATE_MODAL_HEADER_TITLE,
  AOS_LATA_MODAL_HEADER_TITLE,
  IAC_MODAL_HEADER_TITLE,
  IEC_MODAL_HEADER_TITLE,
  AOS_NETWORK_LIST,
  AOS_STATE_LIST,
  AOS_LATA,
  AOS_NPA_LIST,
  CPR_SECT_NAME_ADD_BUTTON,
  CPR_SECT_NAME_SET_BUTTON,
  INVALID_ROW,
  INVALID_COL,
  INIT_LAD_GRID_LENGTH,
  INIT_CPR_GRID_LENGTH,
  DEFAULT_CARRIERS,
  CPR_GRID_CATEGORY_OPTIONS,
  PAGE_NO_PERMISSION_MSG,
  CAD_RETRIEVE_SUCCESSFUL,
  RECORD_PAGE_ACTION_RETRIEVE,
  RECORD_PAGE_ACTION_CREATE,
  RETRIEVE_CARD_TITLE_PREFIX,
  RESULT_CARD_TITLE_PREFIX2,
  LBL_TYPE_AC,
  LBL_TYPE_DT,
  LBL_TYPE_LT,
  LBL_TYPE_NX,
  LBL_TYPE_ST,
  LBL_TYPE_TE,
  LBL_TYPE_TI,
  LBL_TYPE_TD,
  LBL_TYPE_SD,
  LBL_TYPE_DA,
  LBL_TYPE_SW,
  LBL_TYPE_PC,
  LBL_TYPE_CA,
  LBL_TYPE_AN,
  LBL_TYPE_GT,
  TFNUM_REG_EXP,
  TMPLNAME_REG_EXP,
  CADTOTADTYPE_NEW,
  CADTOTADTYPE_EXIST,
  CADTOTADTYPE_COOKIE_NAME,
  CADTOTADSTATE_COOKIE_NAME,
  TRANSFER_PENDING_MSG,
  COPY_PENDING_MSG,
  DISCONNECT_PENDING_MSG,
  CAD_CREATE_SUCCESSFUL,
  CAD_UPDATE_SUCCESSFUL,
  CAD_COPY_SUCCESSFUL,
  CAD_TRANSFER_SUCCESSFUL,
  CAD_DISCONNECT_SUCCESSFUL,
  CAD_DELETE_SUCCESSFUL
} from '../../constants';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {closeEventSource, SseClient} from "angular-sse-client";
import * as gFunc from 'src/app/utils/utils';
import produce from "immer";
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import Cookies from "universal-cookie";
import {environment} from "../../../../environments/environment";
import moment from 'moment';

@Component({
  selector: 'app-customer-admin-data',
  templateUrl: './customer-admin-data.component.html',
  styleUrls: ['./customer-admin-data.component.scss']
})
export class CustomerAdminDataComponent implements OnInit, OnDestroy {
  gFunc = gFunc;
  gConst = {
    ACTION_NONE,
    ACTION_ALL,
    ACTION_CREATE,
    ACTION_UPDATE,
    ACTION_COPY,
    ACTION_TRANSFER,
    ACTION_DISCONNECT,
    ACTION_DELETE,
    CARRIER_LIST,
    COPYACTION_CHANGE,
    COPYACTION_CONVERT,
    COPYACTION_DISCONNECT,
    COPYACTION_NEW,
    STAT_SAVED,
    STAT_PENDING,
    STAT_SENDING,
    STAT_ACTIVE,
    STAT_OLD,
    STAT_INVALID,
    STAT_DISCONNECT,
    STAT_MUSTCHECK,
    STAT_FAILED,
    AOS_NETWORK_MODAL_HEADER_TITLE,
    AOS_STATE_MODAL_HEADER_TITLE,
    AOS_LATA_MODAL_HEADER_TITLE,
    IAC_MODAL_HEADER_TITLE,
    IEC_MODAL_HEADER_TITLE,
    AOS_NETWORK_LIST,
    AOS_STATE_LIST,
    AOS_LATA,
    AOS_NPA_LIST,
    CPR_SECT_NAME_ADD_BUTTON,
    CPR_SECT_NAME_SET_BUTTON,
    INVALID_ROW,
    INVALID_COL,
    INIT_LAD_GRID_LENGTH,
    INIT_CPR_GRID_LENGTH,
    DEFAULT_CARRIERS,
    RECORD_PAGE_ACTION_RETRIEVE,
    RECORD_PAGE_ACTION_CREATE,
    RETRIEVE_CARD_TITLE_PREFIX,
    RESULT_CARD_TITLE_PREFIX2,
    LBL_TYPE_AC,
    LBL_TYPE_DT,
    LBL_TYPE_LT,
    LBL_TYPE_NX,
    LBL_TYPE_ST,
    LBL_TYPE_TE,
    LBL_TYPE_TI,
    LBL_TYPE_TD,
    LBL_TYPE_SD,
    LBL_TYPE_DA,
    LBL_TYPE_SW,
    LBL_TYPE_PC,
    LBL_TYPE_CA,
    LBL_TYPE_AN,
    LBL_TYPE_GT,
    TFNUM_REG_EXP,
    TMPLNAME_REG_EXP,
    CADTOTADTYPE_NEW,
    CADTOTADTYPE_EXIST,
    CADTOTADTYPE_COOKIE_NAME,
    CADTOTADSTATE_COOKIE_NAME,
    TRANSFER_PENDING_MSG,
    COPY_PENDING_MSG,
    DISCONNECT_PENDING_MSG,
  }

  retrieveCardTitle: string = 'Retrieve';
  bRetrieveCardIconHidden: boolean = false;
  bResultHeaderHidden: boolean = false;
  bExpRetrieve: boolean = true;
  inputSearchNum: string = '';
  inputSearchEffDtTm: any = null;
  bRetrieveEnable: boolean = false;
  bEffDtTmDisable: boolean = false;

  resultCardTitle: string = 'Result';
  bExpResult: boolean = false;
  effDtTmStatList: any[] = [];
  selectEffDtTmStat = '';
  bEffDtTmListHidden: boolean = true;

  disable: boolean = true;
  activeMainTab: number = 0;
  activeAOSTab: number = 0;
  activeCarrierTab: number = 0;
  activeCPRTab: number = 0;
  activeLADTab: number = 0;

  action: string = this.gConst.ACTION_NONE;
  copyAction: string = this.gConst.COPYACTION_CHANGE;
  bContentModified: boolean = false;   // if user action has triggered for any one input field, this state is true
  noCR: boolean = true;
  noNetworks: boolean = true;    // there is no newtorks
  noStates: boolean = true    // there is no states
  noNPAs: boolean = true    // there is no NPAs
  noLATAs: boolean = true    // there is no LATAs
  noLabels: boolean = true    // there is no labels
  noIAC: boolean = true    // there is no intraLATACarrier
  noIEC: boolean = true    // there is no interLATACarrier
  status: string = '';      // customer record status

  inputRespOrg: any = '';
  inputCreateEffDtTm: any = null;
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
  inputSvcOrderNum: string = '';
  inputSuppFormNum: string = '';
  inputContactName: string = '';
  inputContactNumber: string = '';
  inputNotes: string = '';
  inputEndIntDtTm: any = null;
  selectReferral = ''
  referralOptions = [
    {name: 'SELECT', value: ''},
    {name: 'No', value: 'N'},
    {name: 'Yes', value: 'Y'},
  ];
  inputNetwork: string = '';
  inputState: string = '';
  inputNpa: string = '';
  inputLata: string = '';
  inputLabel: string = '';
  selectIntraLATACarrier = '';
  intraLATACarrierOptions: any[] = [];
  selectInterLATACarrier = '';
  interLATACarrierOptions: any[] = [];
  destNums = [
    {
      destNum:              '',
      numTermLine:          '',
      localServOff:         '',
      forServOff:           '',
    },
  ];
  selectedDestNums: any[] = [];
  bNoSelDest: boolean = true;

  choiceModalList: any[] = [];       // list that is displayed on the choice list modal
  choiceList: any[] = [];       // list of the choice index on the choice list modal
  choiceModalHeaderTitle: string = '';       // the title of list header on the choice list modal
  choiceModalVisible: boolean = false;    //  choice modal visible
  npaChoiceModalVisible: boolean = false;    // NPA modal visible
  npaChoiceModalList: any[] = [];       // tree list of the NPA choice index on the NPA choice list modal
  npaChecked: any[] = [];       // checked list on the NPA choice list modal
  npaExpanded: any[] = [];       // expanded list on the NPA choice list modal
  cprDelSectModalVisible: boolean = false;    // section delete modal visible

  //CPR Tab
  cprSectNames: any[] = ["MAIN"];
  cprGridCategory: any[] = Array(1).fill(Array(8).fill('')); // category list of each tab
  cprGridData: any[] =  Array(1).fill(Array(INIT_CPR_GRID_LENGTH).fill(Array(8).fill(''))) // grid data of each tab
  cprDeleteModalVisible: boolean = false;
  cprSectNameModalTitle: string = '';
  cprSectSettingName: string =  '';           // section name on the section setting modal
  cprSectNameModalBtnName: string = '';      // modal buttonName
  cprSectNameErr: boolean =  false;            // flag for the error
  cprSectNameModalVisible: boolean = false;   // section setting modal visible
  cprCurActiveRow: any[] = Array(1).fill(this.gConst.INVALID_ROW) // current active row index of each tab
  cprCurActiveCol: any[] =  Array(1).fill(this.gConst.INVALID_COL) // current active col index of each tab

  cprGridCategoryOptions: any[] = CPR_GRID_CATEGORY_OPTIONS;

  noCPR: boolean = true;    // there is no CPR data
  selectPriIntraLT: string = ''/*gConst.DEFAULT_CARRIERS[0]*/ // primary intra LATA carrier
  selectPriInterLT: string = ''/*gConst.DEFAULT_CARRIERS[0]*/ // primary inter LATA carrier
  selectTimezone: string = 'C';                     // timezone
  timezoneOptions = [
    {name: 'Central', value: 'C'},
    {name: 'Atlantic', value: 'A'},
    {name: 'Bering', value: 'B'},
    {name: 'Eastern', value: 'E'},
    {name: 'Hawaiian-Aleutian', value: 'H'},
    {name: 'Mountain', value: 'M'},
    {name: 'Newfoundland', value: 'N'},
    {name: 'Pacific', value: 'P'},
    {name: 'Alaska', value: 'Y'}
  ];
  inputDayLightSaving: boolean = gFunc.isCurrentDayLightSavingTime()             // if day light saving time true, else false
  inputNpaCntPerCarrier: string = '';

  iac_array: any[] = this.gConst.DEFAULT_CARRIERS // intraLATACarrier list
  iec_array:  any[] = this.gConst.DEFAULT_CARRIERS // interLATACarrier list

  //LAD Tab
  ladSectNames: any[] = ["Area Code", "Date", "LATA", "NXX", "State", "Tel#", "Time", "10-digit#", "6-digit#"];
  ladGridCategory: any[] = Array(9).fill(['Label', 'Definition', 'Definition', 'Definition', 'Definition', 'Definition', 'Definition', 'Definition']); // category list of each tab
  ladGridData: any[] =  Array(9).fill(Array(INIT_LAD_GRID_LENGTH).fill(Array(8).fill(''))) // grid data of each tab
  ladDeleteModalVisible: boolean = false;
  ladSectNameModalTitle: string = '';
  ladSectSettingName: string =  '';           // section name on the section setting modal
  ladSectNameModalBtnName: string = '';      // modal buttonName
  ladSectNameErr: boolean =  false;            // flag for the error
  ladSectNameModalVisible: boolean = false;   // section setting modal visible
  ladCurActiveRow: any[] = Array(9).fill(this.gConst.INVALID_ROW) // current active row index of each tab
  ladCurActiveCol: any[] =  Array(9).fill(this.gConst.INVALID_COL) // current active col index of each tab

  inputMessage: string = '';

  bEditEnable: boolean = false;    // Edit button enable status
  bCopyEnable: boolean = false;    // Copy button enable status
  bTransferEnable: boolean = false    // Transfer button enable status
  bDeleteEnable: boolean = false    // Delete button enable status
  bSubmitEnable: boolean = false    // Submit button enable status
  bSaveEnable: boolean = false    // Save button enable status
  bRevertEnable: boolean = false    // Revert button enable status
  bCancelEnable: boolean = false    // Cancel button enable status

  inputSrcNum: string = '';
  inputTgtTmplName: string = '';
  inputSrcEffDtTm: string = '';
  inputTgtNum: string = '';
  inputTgtEffDtTm: any;
  inputCopyNow: boolean = false;
  portionEntire: boolean = false;
  portionCR: boolean = false;
  portionCPR: boolean = false;
  portionLAD: boolean = false;
  validMsg: string = '';

  bCheckCREnable: boolean = false;
  bCheckCPREnable: boolean = false;
  bCheckLADEnable: boolean = false;
  noLAD: boolean = true;    // there is no LAD data
  noNumList: boolean = true    // there is no number list data

  lockParam: any = {}     // parameter that was used for calling lock api
  custRecCompPart: string = '';       // customer record component part

  copyModalVisible: boolean = false;
  transferModalVisible: boolean = false;
  convertModalVisible: boolean = false;
  deleteModalVisible: boolean = false;
  num: string = '';
  nowDateTime: any = new Date();
  numParam: string = '';
  effDtTmParam = '';
  preEffDtTmStat = '';

  recVersionId: string = '';
  srcRecVersionId: string = '';  // source record version id

  tgtRetrieveData: any = {};     // retrieve data of target record

  streamdata_id: string = '/'+Math.floor(Math.random()*999999);

  initialState = produce({
    selectPriIntraLT: this.selectPriIntraLT,
    selectPriInterLT: this.selectPriInterLT,
    selectTimezone: this.selectTimezone,
    inputDayLightSaving: this.inputDayLightSaving
  }, (r) => {});

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public router: Router
  ) { }

  async ngOnInit () {
    await new Promise<void>(resolve => {
      let mainUserInterval = setInterval(() => {
        if (this.store.getUser()) {
          clearInterval(mainUserInterval)

          resolve()
        }
      }, 100)
    })

    // this.store.state$.subscribe(async (state)=> {

    // })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.CUSTOMER_ADMIN_DATA)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    this.intraLATACarrierOptions = this.gConst.CARRIER_LIST.map(item=>({name: item, value: item}));
    this.interLATACarrierOptions = this.gConst.CARRIER_LIST.map(item=>({name: item, value: item}));

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id+this.streamdata_id, { keepAlive: true }).subscribe(async(data): Promise<any> => {
      if(data.page == 'CAD' && data.user_id == this.store.getUser().id) {
        this.inputMessage = data.title + data.message + '<br><br>' + this.inputMessage;
        if(data.completed) {
          if(data.success) {
            this.showSuccess(data.message);
            switch(data.operation) {
              case 'DELETE':
                if (this.effDtTmStatList.length == 1) { // only one record, goes to initial state of page
                  this.cancelAction()
                } else { // if next record exists, shows next record, else shows previous record
                  this.clearAllData()
                  // gets index
                  let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)
    
                  let effDtTmStatList = [...this.effDtTmStatList]
                  effDtTmStatList.splice(index, 1)
                  effDtTmStatList.splice(0, 0, "SELECT")
    
                  this.effDtTmStatList = effDtTmStatList;
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
                break;
              case 'TRANSFER':
                if (data.result.recVersionId != undefined && data.result.recVersionId != null) {
                  this.recVersionId = data.result.recVersionId
                }
          
                if (data.result.recVersionId != null && data.result.effDtTm != null) {
                  if (await this.retrieveCustomerRecord(data?.body?.tgtNum, data.result.effDtTm)) {
          
                  }
                }
                break;
              case 'COPY':
                if (data.result.recVersionId != undefined && data.result.recVersionId != null) {
                  this.recVersionId = data.result.recVersionId
                }
          
                if (data.result.recVersionId != null && data.result.effDtTm != null) {
                  if (await this.retrieveCustomerRecord(data.body.tgtNum, data.result.effDtTm)) {
                    // this.showSuccess(CAD_COPY_SUCCESSFUL);
                    // this.inputMessage = CAD_COPY_SUCCESSFUL
                    this.action = this.gConst.ACTION_NONE
                  }
                }
                break;
              case 'CREATE':
                if (data.result.recVersionId != undefined && data.result.recVersionId != null) {
                  this.recVersionId = data.result.recVersionId;
                }
          
                if (data.result.recVersionId != null) {
                  if (await this.retrieveCustomerRecord(data.body.num, data.body.effDtTm)) {
          
                  }
                }
                break;
              case 'CONVERT':
                this.gotoPTRPage(this.inputSrcNum, data.result.effDtTm)
                break;
              case 'DISCONNECT':
                if (data.result.recVersionId != undefined && data.result.recVersionId != null) {
                  this.recVersionId = data.result.recVersionId;
                }
          
                if (data.result.recVersionId != null && data.result.effDtTm != null) {
                  if (await this.retrieveCustomerRecord(data.body.tgtNum, data.result.effDtTm)) {
          
                  }
                }
          
                // no error, update successful
                if (await this.retrieveCustomerRecord(data.body.tgtNum, data.result.effDtTm)) {
                  // this.showSuccess(CAD_DISCONNECT_SUCCESSFUL);
                  // this.inputMessage = CAD_DISCONNECT_SUCCESSFUL
                  this.action = this.gConst.ACTION_NONE
                }
                break;
              case 'UPDATE':
                if (data.result.recVersionId != undefined && data.result.recVersionId != null) {
                  this.recVersionId = data.result.recVersionId
                }
          
                // if there is any error
                let errList = data.result.errList
                if (errList != undefined && errList != null) {
          
                  let message = gFunc.synthesisErrMsg(errList)
                  // error, but able to retrieve
                  if (data.result.recVersionId != null) {
                    if (await this.retrieveCustomerRecord(data.body.num, data.body.effDtTm)) {
                      if (errList[0].errLvl === "ERROR") {
                        this.showError(message, 'Error');
                      } else {
                        this.showWarn(message);
                      }
                      this.inputMessage = message
                    }
                  } else {
                    this.inputMessage = message
          
                    if (errList[0].errLvl === "ERROR") {
                      this.showError(message, 'Error');
                      return false
          
                    } else {
                      this.showWarn(message);
                    }
                  }
          
                } else {
          
                  // no error, update successful
                  if (await this.retrieveCustomerRecord(data.body.num, data.body.effDtTm)) {
                    // this.showSuccess(CAD_UPDATE_SUCCESSFUL);
                    // this.inputMessage = CAD_UPDATE_SUCCESSFUL;
                  }
                }
                break;
              default:
                break;
            }
          } else {
            this.showError(data.message, 'Error');
          }
        }
      }
    })

    this.initialDataLoading();
  }

  initialDataLoading = async () => {

    this.initCPRData()
    this.ladGridData = Array(9).fill('').map(dd=>([]));

    const cookies = new Cookies();

    let num = cookies.get("cusNum");
    let effDtTm = cookies.get("cusEffDtTm");
    let action = cookies.get("action")

    if (action) {
      switch (action) {
        case this.gConst.RECORD_PAGE_ACTION_RETRIEVE:
          if (effDtTm) {
            let ctDtTmStr = gFunc.fromUTCStrToCTStr(effDtTm)
            let time = new Date(ctDtTmStr)
            this.inputSearchNum = num
            this.inputSearchEffDtTm = time;
            this.bRetrieveEnable = false;
          } else {
            this.inputSearchNum = num;
            this.bRetrieveEnable = false
          }
          if (await this.retrieveCustomerRecord(num, effDtTm, true)) {
            this.inputMessage = CAD_RETRIEVE_SUCCESSFUL
          }
          break

        case this.gConst.RECORD_PAGE_ACTION_CREATE:
          let retrieveCardTitle = "Create a New Customer Record: " + gFunc.formattedNumber(num)
          this.action = this.gConst.ACTION_CREATE;
          this.disable = false;
          this.num = num?.replace(/-/g, "");
          this.destNums = [
            {
              destNum: gFunc.formattedNumber(num),
              numTermLine: '9999',
              localServOff:         '',
              forServOff:           '',
            }
          ],
          this.inputSvcOrderNum = 'N' + moment().format('MMDDYY');
          this.retrieveCardTitle = retrieveCardTitle;
          this.bRetrieveCardIconHidden = true;
          this.bResultHeaderHidden = true;
          this.bExpRetrieve = false;
          this.bExpResult = true;

          this.bEditEnable = false;
          this.bCopyEnable = false;
          this.bTransferEnable = false;
          this.bDeleteEnable = false;

          this.inputContactName = this.store.getContactInformation().name;
          this.inputContactNumber = this.store.getContactInformation().number;
          this.inputNetwork = 'US';
          this.selectInterLATACarrier = 'ATX-0288';
          this.selectIntraLATACarrier = 'ATX-0288';

          let body = {
            numList:[
              num?.replace(/\-/g, "")
            ]
          }

          // this.api.numberQuery({body: JSON.stringify(body), ro: this.store.getCurrentRo()}).subscribe(res => {
          //   if (res) {
          //     let result = res.queryResult[0]
          //     this.inputRespOrg = result.ctrlRespOrgId;
          //   }
          // })
          break
      }

      cookies.remove("cusNum");
      cookies.remove("cusEffDtTm");
      cookies.remove("action");

    }
  }

  ngOnDestroy(): void {
    closeEventSource(environment.stream_uri+"/"+this.store.getUser()?.id+this.streamdata_id)
  }

  getPriIntraLTOptions = () => {
    let options = this.iac_array.map(item=>({name: item, value: item}));
    return [{name: 'Select', value: ''}, ...options];
  }

  getPriInterLTOptions = () => {
    let options = this.iec_array.map(item=>({name: item, value: item}));
    return [{name: 'Select', value: ''}, ...options];
  }

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
      this.preEffDtTmStat = '';   // sets as empty her
    } else if (await this.retrieveCustomerRecord(this.inputSearchNum?.replace(/\W/g, ''), searchUTCString, true)) {
      this.inputMessage = CAD_RETRIEVE_SUCCESSFUL;
    }
  }

  retrieveCustomerRecord = async (num: string, effDtTm: string, isUserAct = false) => {
    this.bRetrieveEnable = false

    let ro = this.store.getCurrentRo();

    num = num?.replace(/\-/g, "")
    if (effDtTm != "NOW")
      effDtTm = effDtTm?.replace(/\-/g, "")?.replace(":", "");

    return await new Promise<any>(resolve=>{
      this.api.retrieveCadRec(ro, num, effDtTm).subscribe(res => {
        // console.log(">>> retrieveCadRec: ", res)

        if (res) {
          let data = res;
          if (data.num == null) {
            if (data.numStatus != null && data.numStatus === "RESERVED") {
              this.createAction();
              resolve(false)
            } else {
              this.bRetrieveEnable = true
              resolve(false)
            }
          }
          this.unlockCustomerRecord()
          this.reflectDataOnPage(num, res)
          // this.backupStateToLastAction()
          resolve(true)  
        } else if (res !== undefined && res.errList !== undefined && res.errList.length) {
          this.showError(gFunc.synthesisErrMsg(res.errList), 'Error');
          this.inputMessage = gFunc.synthesisErrMsg(res.errList);
          this.bRetrieveEnable = true
          resolve(false);
        } else {
          let message = "An unknown error occurred."
          this.showError(message, 'Error');
          this.inputMessage = message;
          this.bRetrieveEnable = true
          resolve(false);
        }
      })
    });
  };

  /**
   * reflect the retrieved data on page
   * @param data
  */
  reflectDataOnPage = (num: string, data: any) => {
    let effDtTm = data.effDtTm

    // gets the list of effective date time
    let lstEffDtTms = data.lstEffDtTms

    // if no result, shows the message if moves to create mode
    if (!Boolean(lstEffDtTms) || !Boolean(lstEffDtTms)) {
      this.createAction();
      return
    }

    // effective date time status list
    let nEffIndex = 0
    let dtTmStatList = []

    for (let i = 0; i < lstEffDtTms.length; i++) {
      let edt = lstEffDtTms[i]
      let dtTmString = gFunc.fromUTCStrToCTStr(edt.effDtTm)
      let dtTmStat = dtTmString + " CT " + edt.custRecStat?.replace("_", " ") + " " + edt.custRecCompPart.substring(0, 3)
      dtTmStatList.push(dtTmStat)

      // if (effDtTm == edt.effDtTm) {
      //   nEffIndex = i;
      // }
    }

    nEffIndex = this.getEffDtTmStatusOptions(this.effDtTmStatList).findIndex(item=>item.value.includes(this.selectEffDtTmStat));
    nEffIndex = nEffIndex == -1 ? 0 : nEffIndex
    
    // if the record was activated by PAD, go to the PAD page
    if (lstEffDtTms[nEffIndex]?.custRecCompPart?.includes("PAD")) {
      this.gotoPTRPage(num, effDtTm)
      return
    }

    let status = lstEffDtTms[nEffIndex]?.custRecStat?.replace("_", " ")

    this.num = num?.replace(/-/g, "");
    this.retrieveCardTitle =  this.gConst.RETRIEVE_CARD_TITLE_PREFIX + ": " + gFunc.formattedNumber(num);
    this.bRetrieveCardIconHidden = true;
    this.resultCardTitle =    this.gConst.RESULT_CARD_TITLE_PREFIX2;
    this.bResultHeaderHidden =false;
    this.bEffDtTmListHidden = false;
    this.bExpRetrieve =       false;
    this.bExpResult =         true;
    this.effDtTmStatList =    dtTmStatList;
    this.selectEffDtTmStat =        dtTmStatList[nEffIndex];
    this.status =             status;
    this.custRecCompPart =    lstEffDtTms[nEffIndex].custRecCompPart?.replace(/\_/g, ", ");

    // get basic data
    let interLATACarrier = data.interLATACarrier != null ? data.interLATACarrier : []
    let intraLATACarrier = data.intraLATACarrier != null ? data.intraLATACarrier : []

    let aosLbl = [], aosNPA = [], aosLATA = [], aosNet = [], aosState = []
    if (data.aos) {
      aosLbl = Boolean(data.aos.aosLbl) ? data.aos.aosLbl : []
      aosNPA = Boolean(data.aos.aosNPA) ? data.aos.aosNPA : []
      aosLATA = Boolean(data.aos.aosLATA) ? data.aos.aosLATA : []
      aosNet = Boolean(data.aos.aosNet) ? data.aos.aosNet : []
      aosState = Boolean(data.aos.aosState) ? data.aos.aosState : []
    }

    let noCPR = true, noLAD = true
    if (data.lbl && data.lbl.length)
      noLAD = false
    if (data.cprSectName && data.cprSectName.length)
      noCPR = false

    this.ladGridData = Array(9).fill('').map(dd=>([]));
    if(data.lbl) {
      data.lbl.forEach((item: any)=>{
        switch(item.lblType) {
          case LBL_TYPE_SD:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[8] = [
                ...this.ladGridData[8],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_LT:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[2] = [
                ...this.ladGridData[2],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_DT:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[1] = [
                ...this.ladGridData[1],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_AC:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[0] = [
                ...this.ladGridData[0],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_NX:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[3] = [
                ...this.ladGridData[3],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_ST:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[4] = [
                ...this.ladGridData[4],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_TE:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[5] = [
                ...this.ladGridData[5],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_TI:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[6] = [
                ...this.ladGridData[6],
                ...arrangeData,
              ];
            });
            break;
          case LBL_TYPE_TD:
            this.arrangeLadData(item.lblName, item.lblVals).then((arrangeData: any[])=>{
              this.ladGridData[7] = [
                ...this.ladGridData[7],
                ...arrangeData,
              ];
            });
            break;
        }
      });
      this.noLAD = false
    }

    // set the prev user and last user
    let lastUsr = '', prevUsr = '', lastUpDt = ''
    if (Boolean(data.lastUsr))
      lastUsr = data.lastUsr
    if (Boolean(data.prevUsr))
      prevUsr = data.prevUsr
    if (Boolean(data.lastUpDt) && Boolean(data.lastUpDt))
      lastUpDt = gFunc.fromUTCStrToCTStr(data.lastUpDt)

    let cprGridCategory = []
    let cprGridData = []
    let cprSectNames = []
    let cprCurActiveRow = []
    let cprCurActiveCol = []
    if (Boolean(data.cprSectName) && Boolean(data.cprSectName) && data.cprSectName.length > 0) {

      let sectCount = data.cprSectName.length
      cprCurActiveRow = new Array(sectCount).fill(this.gConst.INVALID_ROW)
      cprCurActiveCol = new Array(sectCount).fill(this.gConst.INVALID_COL)

      for (let sect of data.cprSectName) {
        // add section name
        cprSectNames.push(sect.name)

        let cprRows = 0
        let cprCols = 0

        // config category and add to cpr grid category
        for (let node of sect.nodes) {
          cprRows = Math.max(cprRows, node.rowIndex)
          cprCols = Math.max(cprCols, node.colIndex)
        }

        let subCategory = new Array(cprCols).fill('')
        let nIndex = 0
        for (let category of sect.nodeSeq) {
          subCategory[nIndex++] = category
        }
        cprGridCategory.push(subCategory)

        // configure cpr grid
        let subData = new Array(cprRows).fill(0).map(() => new Array(cprCols).fill(''));
        for (let node of sect.nodes) {
          if (node.values.length > 0)
            subData[node.rowIndex - 1][node.colIndex - 1] = node.values[0]
        }
        cprGridData.push(subData)
      }

      this.cprSectNames = cprSectNames;
      this.cprGridCategory = cprGridCategory;
      this.cprGridData =  cprGridData;
      this.cprCurActiveRow = cprCurActiveRow;
      this.cprCurActiveCol = cprCurActiveCol;

    } else { // no cpr data then, config initial cpr data
      this.initCPRData()
    }

    let destNums = []
    if (data.destNums != null && data.destNums.length > 0) {
      for (let el of data.destNums) {
        let destNum = {
          destNum: gFunc.formattedNumber(el.destNum),
          numTermLine: el.numTermLine ? el.numTermLine : '',
          localServOff: el.localServOff ? el.localServOff : '',
          forServOff: el.forServOff ? el.forServOff : ''
        }
        destNums.push(destNum)
      }
    }

    if (destNums.length === 0) {
      let destNum = {
        destNum: '',
        numTermLine: '',
        localServOff: '',
        forServOff: ''
      }
      destNums.push(destNum)
    }

    this.num = num?.replace(/-/g, "");
    this.inputRespOrg = data.ctrlRespOrgId;
    this.inputApproval = data.lstEffDtTms[nEffIndex].apprStat?.replace(/\_/g, " ");
    this.inputPriority =     (data.priority == 'Y');
    this.inputCustomerId = data.onAccCust ? data.onAccCust : '';

    this.inputAgent = data.agent ? data.agent: '';
    this.inputTelco = data.telco ? data.telco: '';
    this.selectHold = data.hldIndFlag;

    this.inputEndSub = data.endSub ? data.endSub : '';
    this.inputEndSubAddr = data.endSubAddr ? data.endSubAddr : '';
    this.inputSvcOrderNum = data.svcOrderNum ? data.svcOrderNum : '';
    this.inputSuppFormNum = data.suppFormNum ? data.suppFormNum : '';

    this.inputLastUpDt = lastUpDt;
    this.inputLastUser = lastUsr;
    this.inputPrevUser = prevUsr;

    this.destNums = destNums;
    this.inputContactName = data.conName ? data.conName : '';
    this.inputContactNumber = data.conTel ? gFunc.formattedNumber(data.conTel) : '';
    this.inputNotes = data.notes ? data.notes : '';

    this.inputNetwork = aosNet.join(',');
    this.inputLabel = aosLbl.join(',');
    this.inputNpa = aosNPA.join(',');
    this.inputLata = aosLATA.join(',');
    this.inputState = aosState.join(',');

    this.selectIntraLATACarrier = intraLATACarrier.join(',');
    this.selectInterLATACarrier = interLATACarrier.join(',');

    this.noCPR = noCPR;
    this.noLAD = noLAD;
    this.noCR = false;

    this.noNetworks = aosNet.length === 0;
    this.noStates = aosState.length === 0;
    this.noNPAs = aosNPA.length === 0;
    this.noLATAs = aosLATA.length === 0;
    this.noLabels = aosLbl.length === 0;
    this.noIAC = intraLATACarrier.length === 0;
    this.noIEC = interLATACarrier.length === 0;

    this.iec_array = this.getMergedCarriers(interLATACarrier);
    this.iac_array = this.getMergedCarriers(intraLATACarrier);
    this.selectPriIntraLT = data.priIntraLT != null ? data.priIntraLT : '';
    this.selectPriInterLT = data.priInterLT != null ? data.priInterLT : '';
    this.selectTimezone = data.tmZn;
    this.inputDayLightSaving = (data.dayLightSavings === 'Y');

    this.recVersionId = data.recVersionId;

    // if current date is before than the the date of selected record
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

  /**
   * get the merged carriers between Default carriers and carriers that the user added
   * @param carriers: the carriers that the user added
   */
  getMergedCarriers = (carriers: any[]) => {
    let mergedCarriers = [...this.gConst.DEFAULT_CARRIERS]

    // merge carriers
    for (let carrier of carriers) {
      if (mergedCarriers.indexOf(carrier) === - 1) {
        mergedCarriers.push(carrier)
      }
    }

    // sort a to z
    mergedCarriers.sort(function (a, b) {
      if (a > b)
        return 1
      else if (a < b)
        return -1

      return 0
    })

    return mergedCarriers
  }

    /**
     * initialize CPR data
     */
    initCPRData = () => {
      this.activeCPRTab = 0;
      this.cprSectNames = ["MAIN"];
      this.cprGridCategory = Array(1).fill(Array(8).fill(''));
      this.cprGridData = Array(1).fill(Array(INIT_CPR_GRID_LENGTH).fill(Array(8).fill('')));
      this.cprCurActiveRow = Array(1).fill(this.gConst.INVALID_ROW);
      this.cprCurActiveCol = Array(1).fill(this.gConst.INVALID_COL);
      this.selectPriIntraLT = '';
      this.selectPriInterLT = '';
      this.selectTimezone = 'C';
      this.inputDayLightSaving = gFunc.isCurrentDayLightSavingTime();

      this.noCPR =true;
    }
  
  arrangeLadData = (lblName: string, lblVals: any[]) => {
    if(lblVals.length % 7 != 0 ) {
      lblVals = lblVals.concat(Array(7-(lblVals.length % 7)).fill(''));
    }
    return new Promise<any[]>((resolve, reject) => {
      let tmp: any[] = [];
      tmp = [...tmp, [lblName, ...lblVals.splice(0, 7)]];
      while(lblVals.length) {
        tmp = [...tmp, ['', ...lblVals.splice(0,7)]];
      }
      resolve(tmp);
    });
  }

  /**
 * go to the Pointer record page
 * @param num
 * @param effDtTm
 */
  gotoPTRPage = (num: string, effDtTm: string) => {
    const cookies = new Cookies();
    cookies.set("ptrNum", num);
    cookies.set("ptrEffDtTm", effDtTm);
    cookies.set("action", this.gConst.RECORD_PAGE_ACTION_RETRIEVE)
    this.router.navigateByUrl(ROUTES.customerAdmin.pad)

    // this.setState(JSON.parse(JSON.stringify(this.initialState)));
  }

  createAction = async () => {
    // lock the number
    let ro = this.store.getCurrentRo();
    let body = { custRecAction: this.gConst.ACTION_ALL, srcNum: this.inputSearchNum?.replace(/\W/g, ''), custRecCompPart: "CAD" }
    let res = await new Promise<any>(resolve=> {
      this.api.lockCadRec({body: JSON.stringify(body), ro: ro}).subscribe(res=>{
        resolve(res);
      });
    });
    
    if (res.success) {
      if (res.createStatus.isAllowed === 'N') {

        this.bRetrieveEnable = true
        if (res.createStatus.statusMessages)
          this.showError("", res.createStatus.statusMessages[0].errMsg)
        return
      }
    }

    let retrieveCardTitle = "Create a New Customer Record: " + gFunc.formattedNumber(this.inputSearchNum)
    this.action = this.gConst.ACTION_CREATE;
    this.disable = false;
    this.num = this.inputSearchNum?.replace(/\W/g, '');
    this.retrieveCardTitle = retrieveCardTitle;
    this.bRetrieveCardIconHidden = true;
    this.bResultHeaderHidden = true;
    this.bExpRetrieve = false;
    this.bExpResult = true;

    this.bEditEnable = false;
    this.bCopyEnable = false;
    this.bTransferEnable = false;
    this.bDeleteEnable = false;

    this.clearAllData();

    // get user information from the server and set the mail.
    this.inputContactName = this.store.getContactInformation().name;
    this.inputContactNumber = gFunc.formattedNumber(this.store.getContactInformation().number);
  };

  onImportFileSelected = (event: any) => {

  }

  onClearBasicData = () => {

  }

  onAddDestination = () => {

  }

  onRemoveDestination = () => {

  }

  handleOnCR = () => {
    this.bContentModified = true;
    this.checkDataExistForCR();
  }

  handleOnCPR = () => {
    this.bContentModified = true;
    this.checkDataExistForCPR()
  }

  handleDestNums = (event: Event, key: string, i_index: number) => {
    this.destNums = this.destNums.map((item, index)=>{
      if(i_index==index) {
        switch(key) {
          case 'destNum':
            return {destNum: (event.target as HTMLInputElement).value, numTermLine: item.numTermLine, localServOff: item.localServOff, forServOff: item.forServOff};
          case 'numTermLine':
            return {destNum: item.destNum, numTermLine: (event.target as HTMLInputElement).value, localServOff: item.localServOff, forServOff: item.forServOff};
          default:
            return item;
        }
      } else {
        return item;
      }
    });

    this.bContentModified = true;

    this.checkDataExistForCR();
  }

  handleEndIntDtTm = () => {
    this.bContentModified = true;
    this.checkDataExistForCR()
  }

  handleUppercase = (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (input.name != "searchNum") {
      this.bContentModified = true;
    }
    this.checkDataExistForCR()
  }

  onSelectAosNetwork = () => {
    let choiceList: any[] = []
    if (this.inputNetwork !== '')
      choiceList = this.inputNetwork?.replace(/\ /g, "").split(",")

    this.choiceModalVisible = true;
    this.choiceModalHeaderTitle = this.gConst.AOS_NETWORK_MODAL_HEADER_TITLE;
    this.choiceModalList = this.gConst.AOS_NETWORK_LIST;
    this.choiceList = choiceList;
  }

  onClearAosNetwork = () => {
    this.inputNetwork = '';
    this.bContentModified = true;
    this.checkDataExistForCR();
  }

  onSelectAosState = () => {
    let choiceList: any[] = []
    if (this.inputState !== '')
      choiceList = this.inputState?.replace(/\ /g, "").split(",")

      this.choiceModalVisible = true,
      this.choiceModalHeaderTitle = AOS_STATE_MODAL_HEADER_TITLE,
      this.choiceModalList = this.gConst.AOS_STATE_LIST,
      this.choiceList = choiceList;
  }
  onClearAosState = () => {
    this.inputState = '';
    this.bContentModified = true;
    this.checkDataExistForCR()
  }

  onSelectAosNPA = () => {
      // config state-npa list
      interface IStateNPA {
        label: string,
        value: string,
        children: any[]
      };
      let npaChoiceModalList: any[] = [];
      this.gConst.AOS_STATE_LIST.map((state, index) => {
        let stateNPA: IStateNPA = {label: state, value: state, children: []}

        let npaList = this.gConst.AOS_NPA_LIST[index].split(",")
        npaList.map((npa) => {
          let npaLeaf = {label: npa, value: npa}
          stateNPA.children.push(npaLeaf)
        })

        npaChoiceModalList.push(stateNPA)
      })

      // get checked list
      let npaObject: any = this.inputNpa
      if (typeof this.inputNpa == "string") {
        npaObject = this.inputNpa.trim().split(",")
      }

      this.npaChoiceModalVisible = true;
      this.npaChoiceModalList = npaChoiceModalList;
      this.npaChecked = npaObject;
      this.npaExpanded = [];
  }

  onClearAosNPA = () => {
    this.inputNpa = '';
    this.bContentModified = true;
    this.checkDataExistForCR();
  }

  onSelectAosLATA = () => {
    let choiceList: any[] = [];
    if (this.inputLata !== '')
      choiceList = this.inputLata?.replace(/\ /g, "").split(",")

    let lataList = this.gConst.AOS_LATA.split(",")

    this.choiceModalVisible = true;
    this.choiceModalHeaderTitle = AOS_LATA_MODAL_HEADER_TITLE;
    this.choiceModalList = lataList;
    this.choiceList = choiceList;
  }

  onClearAosLATA = () => {
    this.inputLata = '';
    this.bContentModified = true;
    this.checkDataExistForCR();
  }

  onSelectAosLabel = () => {

  }

  onClearAosLabel = () => {
    this.inputLabel = '';
    this.bContentModified = true;
    this.checkDataExistForCR();
  }

  onDeleteCpr = () => {
    this.cprDeleteModalVisible = true;
  }

  handleCarrierSelect = () => {
    this.bContentModified = true;
    this.checkDataExistForCR()
  }

  onEffDtTmSelChange = async () => {
    let UTCTimeStr = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // if any modified, shows the modal asking if really will do
    if (this.bContentModified) {
      this.numParam = this.num
      this.effDtTmParam = UTCTimeStr
      this.preEffDtTmStat = this.selectEffDtTmStat
      // this.modifiedModalVisible = true
    } else if (await this.retrieveCustomerRecord(this.num, UTCTimeStr, true)) {
      this.inputMessage = CAD_RETRIEVE_SUCCESSFUL
    }
  }

  getEffDtTmStatusOptions = (effDtTmStatList: any[]) => {
    return effDtTmStatList.map(item=>({name: item, value: item}));
  }

  onEditCprSectName = () => {
    let index = this.activeCPRTab;

    this.cprSectNameModalTitle = 'Edit Section Name';
    this.cprSectSettingName = this.cprSectNames[index];
    this.cprSectNameModalBtnName = CPR_SECT_NAME_SET_BUTTON;
    this.cprSectNameErr = false;
    this.cprSectNameModalVisible = true;
  }

  onAddCprSect = () => {
    let settingName = ''
    if (this.cprSectNames.length == 0) {
      settingName = 'MAIN'
    }
    this.cprSectNameModalTitle = 'Add Section'
    this.cprSectSettingName = settingName
    this.cprSectNameModalBtnName = CPR_SECT_NAME_ADD_BUTTON
    this.cprSectNameErr = false
    this.cprSectNameModalVisible = true
  }

  onDeleteCprSect = () => {
    let index = this.activeCPRTab
    let curSectName = this.cprSectNames[index]

    // if current section name is started with M, check if another section name is started with M
    if (curSectName[0] == 'M') {
      let bAnotherM = false
      for (let i = 0; i < this.cprSectNames.length; i++) {
        if (i == index) continue

        if(this.cprSectNames[i][0] == 'M') {
          bAnotherM = true
          break
        }
      }

      // if there is no section that the name is started with M
      if (!bAnotherM) {
        this.showWarn("The current section can't be deleted because there is no section that is started with M");
        return;
      }
    }

    this.cprDelSectModalVisible = true;
  }

  setCPRActiveIndexes = (index: number, row: number, cell: number) => {
    let cprCurActiveRow = [...this.cprCurActiveRow]
    let cprCurActiveCol = [...this.cprCurActiveCol]

    cprCurActiveRow[index] = row
    cprCurActiveCol[index] = cell

    this.cprCurActiveRow = cprCurActiveRow;
    this.cprCurActiveCol = cprCurActiveCol;
  }

  handleCPRSelectChange = (event: Event, index: number) => {
    this.bContentModified = true;
    // this.checkDataExistForCPR()  // do not call because no need
  }

  onCPRFieldFocusOut = () => {
    this.checkDataExistForCPR()
  }

  handleCPRCellChange = (event: Event, index: number) => {
    let cprGridData = [...this.cprGridData]

    if((event.target as HTMLInputElement).value.includes("\t")) {
      cprGridData[index] = this.getCopyPasteValue(event)
      this.cprGridData = cprGridData;
    } else {
      cprGridData[index] = gFunc.handle_value_cpr(event, this.cprGridData[index])
      this.cprGridData = cprGridData;
    }

    this.bContentModified = true;
    //this.checkDataExistForCPR() // do not call because no need
  }

  /**
   * insert row before indicated row
   */
    onInsertCPRRowAbove = () => {
    let index = this.activeCPRTab
    let cprGridData = [...this.cprGridData]
    let cprCurActiveRow = [...this.cprCurActiveRow]

    let activeRow = cprCurActiveRow[index] != this.gConst.INVALID_ROW ? cprCurActiveRow[index] : 0;
    cprGridData[index].splice(activeRow, 0, Array(cprGridData[index][0].length).fill(""))
    cprCurActiveRow[index] = this.gConst.INVALID_ROW

    this.cprGridData = cprGridData;
    this.cprCurActiveRow = cprCurActiveRow;
    this.bContentModified = true;
  }

  /**
   * insert row after indicated row
   */
  onInsertCPRRowBelow = () => {
    let index = this.activeCPRTab
    let cprGridData = [...this.cprGridData]
    let cprCurActiveRow = [...this.cprCurActiveRow]

    let activeRow = cprCurActiveRow[index] != this.gConst.INVALID_ROW ? cprCurActiveRow[index] : cprGridData[index].length;
    let belowRow = activeRow == 0 ? activeRow : activeRow + 1
    cprGridData[index].splice(belowRow, 0, Array(cprGridData[index][0].length).fill(""))
    cprCurActiveRow[index] = this.gConst.INVALID_ROW

    this.cprGridData = cprGridData;
    this.cprCurActiveRow = cprCurActiveRow;
    this.bContentModified = true;
  }

  /**
   * insert a row to last
   */
  onInsertCPRRowEnd = () => {
    let index = this.activeCPRTab
    let cprGridData = [...this.cprGridData]
    cprGridData[index] = gFunc.insert_row(cprGridData[index]);
    this.cprGridData = cprGridData;
    this.bContentModified = true;
  };

  /**
   * delete last row
   */
  onDeleteCPRRowEnd = (): any => {
    let index = this.activeCPRTab
    let rowLength = this.cprGridData[index].length;
    if(rowLength == 1) return false;

    let cprCurActiveCol = [...this.cprCurActiveCol]
    let activeCol = cprCurActiveCol[index] == this.gConst.INVALID_COL ? rowLength - 1 : this.cprCurActiveRow[index];
    let cprGridData = [...this.cprGridData];
    cprGridData[index].splice(activeCol, 1);
    cprCurActiveCol[index] = this.gConst.INVALID_COL

    this.cprGridData = cprGridData;
    this.cprCurActiveCol = cprCurActiveCol;
    this.bContentModified = true;
  };

  /**
   * insert column to left of indicated col
   */
  onInsertCPRColumnBefore = () => {
    let index = this.activeCPRTab
    let cprGridData = [...this.cprGridData]
    let cprGridCategory = [...this.cprGridCategory]
    let cprCurActiveCol = [...this.cprCurActiveCol]

    let colLength = cprGridData[index][0].length
    let activeCol = cprCurActiveCol[index] == this.gConst.INVALID_COL ? 0 : cprCurActiveCol[index];
    activeCol = activeCol < 0 ? 0 : activeCol;

    cprGridData[index][0].splice(activeCol, 0, "");
    if (cprGridData[index].length > 1 && cprGridData[index][1].length == colLength) {
      for (let i = 1; i < cprGridData[index].length; i++) {
        cprGridData[index][i].splice(activeCol, 0, "");
      }
    }
    cprGridCategory[index].splice(activeCol, 0, "");
    cprCurActiveCol[index] = this.gConst.INVALID_COL

    this.cprGridData = cprGridData;
    this.cprGridCategory = cprGridCategory;
    this.cprCurActiveCol = cprCurActiveCol;
    this.bContentModified = true;
  }

  /**
   * insert column to right of indicated col
   */
  onInsertCPRColumnAfter = () => {
    let index = this.activeCPRTab
    let cprGridData = [...this.cprGridData]
    let cprGridCategory = [...this.cprGridCategory]
    let cprCurActiveCol = [...this.cprCurActiveCol]

    let colLength = cprGridData[index][0].length
    let activeCol = cprCurActiveCol[index] == this.gConst.INVALID_COL ? colLength : cprCurActiveCol[index] + 1

    cprGridData[index][0].splice(activeCol, 0, "")
    if (cprGridData[index].length > 1 && cprGridData[index][1].length == colLength) {
      for (let i = 1; i < cprGridData[index].length; i++) {
        cprGridData[index][i].splice(activeCol, 0, "")
      }
    }
    cprGridCategory[index].splice(activeCol, 0, "")
    cprCurActiveCol[index] = this.gConst.INVALID_COL

    this.cprGridData = cprGridData;
    this.cprGridCategory = cprGridCategory;
    this.cprCurActiveCol = cprCurActiveCol;
    this.bContentModified = true;
  }

  /**
   * insert a column to last
   */
  onInsertCPRColumnLast = () => {
    let index = this.activeCPRTab
    let cprGridData = [...this.cprGridData];
    let cprGridCategory = [...this.cprGridCategory];

    let colLength = cprGridData[index][0].length;
    let activeCol = cprGridData[index][0].length;

    cprGridData[index][0].splice(activeCol, 0, "");
    if (cprGridData[index].length > 1 && cprGridData[index][1].length == colLength) {
      for (let i = 1; i < cprGridData[index].length; i++) {
        cprGridData[index][i].splice(activeCol, 0, "");
      }
    }

    cprGridCategory[index].splice(activeCol, 0, "");

    this.cprGridData = cprGridData;
    this.cprGridCategory = cprGridCategory;
    this.bContentModified = true;
  };

  /**
   * delete active column
   */
  onDeleteCPRColumn = (): any => {
    let index = this.activeCPRTab
    let cprGridCategory = Array.from(this.cprGridCategory)
    let cprGridData = Array.from(this.cprGridData)
    let cprCurActiveCol = Array.from(this.cprCurActiveCol)

    let colLength = cprGridData[index][0].length
    let activeCol = cprCurActiveCol[index] === this.gConst.INVALID_COL ? colLength - 1  : cprCurActiveCol[index];
    if(colLength === 1) return false;

    // console.log("onDeleteCPRColumn Last state: " + JSON.stringify(this.lastActionState.cprGridData))
    for (let i = 0; i < cprGridData[index].length; i++) {
      // for (let j = activeCol; j < colLength - 1; j++) {
      //   cprGridData[index][i][j] = cprGridData[index][i][j + 1] !== null ? cprGridData[index][i][j + 1] : ""
      // }
      // cprGridData[index][i].splice(colLength - 1, 1);
      cprGridData[index][i].splice(activeCol, 1);
    }

    // cprGridData[index][0].splice(activeCol, 1);
    // if (cprGridData[index].length > 1 && cprGridData[index][1].length === colLength) {
    //   for (let i = 1; i < cprGridData[index].length; i++) {
    //     cprGridData[index][i].splice(activeCol, 1);
    //   }
    // }

    cprGridCategory[index].splice(activeCol, 1);
    cprCurActiveCol[index] = this.gConst.INVALID_COL

    this.cprGridData = cprGridData;
    this.cprGridCategory = cprGridCategory;
    this.cprCurActiveCol = cprCurActiveCol;
    this.bContentModified = true;
  };

  /**
   * insert row before indicated row
   */
   onInsertLADRowAbove = () => {
    let index = this.activeLADTab
    let ladGridData = [...this.ladGridData]
    let ladCurActiveRow = [...this.ladCurActiveRow]

    let activeRow = ladCurActiveRow[index] != this.gConst.INVALID_ROW ? ladCurActiveRow[index] : 0;
    ladGridData[index].splice(activeRow, 0, Array(ladGridData[index][0].length).fill(""))
    ladCurActiveRow[index] = this.gConst.INVALID_ROW

    this.ladGridData = ladGridData;
    this.ladCurActiveRow = ladCurActiveRow;
    this.bContentModified = true;
  }

  /**
   * insert row after indicated row
   */
  onInsertLADRowBelow = () => {
    let index = this.activeLADTab
    let ladGridData = [...this.ladGridData]
    let ladCurActiveRow = [...this.ladCurActiveRow]

    let activeRow = ladCurActiveRow[index] != this.gConst.INVALID_ROW ? ladCurActiveRow[index] : ladGridData[index].length;
    let belowRow = activeRow == 0 ? activeRow : activeRow + 1
    ladGridData[index].splice(belowRow, 0, Array(ladGridData[index][0].length).fill(""))
    ladCurActiveRow[index] = this.gConst.INVALID_ROW

    this.ladGridData = ladGridData;
    this.ladCurActiveRow = ladCurActiveRow;
    this.bContentModified = true;
  }

  /**
   * insert a row to last
   */
  onInsertLADRowEnd = () => {
    let index = this.activeLADTab
    let ladGridData = [...this.ladGridData]
    ladGridData[index] = gFunc.insert_row(ladGridData[index]);
    this.ladGridData = ladGridData;
    this.bContentModified = true;
  };

  /**
   * delete last row
   */
  onDeleteLADRowEnd = (): any => {
    let index = this.activeLADTab
    let rowLength = this.ladGridData[index].length;
    if(rowLength == 1) return false;

    let ladCurActiveCol = [...this.ladCurActiveCol]
    let activeCol = ladCurActiveCol[index] == this.gConst.INVALID_COL ? rowLength - 1 : this.ladCurActiveRow[index];
    let ladGridData = [...this.ladGridData];
    ladGridData[index].splice(activeCol, 1);
    ladCurActiveCol[index] = this.gConst.INVALID_COL

    this.ladGridData = ladGridData;
    this.ladCurActiveCol = ladCurActiveCol;
    this.bContentModified = true;
  };

  /**
   * insert column to left of indicated col
   */
  onInsertLADColumnBefore = () => {
    let index = this.activeLADTab
    let ladGridData = [...this.ladGridData]
    let ladGridCategory = [...this.ladGridCategory]
    let ladCurActiveCol = [...this.ladCurActiveCol]

    let colLength = ladGridData[index][0].length
    let activeCol = ladCurActiveCol[index] == this.gConst.INVALID_COL ? 0 : ladCurActiveCol[index];
    activeCol = activeCol < 0 ? 0 : activeCol;

    ladGridData[index][0].splice(activeCol, 0, "");
    if (ladGridData[index].length > 1 && ladGridData[index][1].length == colLength) {
      for (let i = 1; i < ladGridData[index].length; i++) {
        ladGridData[index][i].splice(activeCol, 0, "");
      }
    }
    ladGridCategory[index].splice(activeCol, 0, "Definition");
    ladCurActiveCol[index] = this.gConst.INVALID_COL

    this.ladGridData = ladGridData;
    this.ladGridCategory = ladGridCategory;
    this.ladCurActiveCol = ladCurActiveCol;
    this.bContentModified = true;
  }

  /**
   * insert column to right of indicated col
   */
  onInsertLADColumnAfter = () => {
    let index = this.activeLADTab
    let ladGridData = [...this.ladGridData]
    let ladGridCategory = [...this.ladGridCategory]
    let ladCurActiveCol = [...this.ladCurActiveCol]

    let colLength = ladGridData[index][0].length
    let activeCol = ladCurActiveCol[index] == this.gConst.INVALID_COL ? colLength : ladCurActiveCol[index] + 1

    ladGridData[index][0].splice(activeCol, 0, "")
    if (ladGridData[index].length > 1 && ladGridData[index][1].length == colLength) {
      for (let i = 1; i < ladGridData[index].length; i++) {
        ladGridData[index][i].splice(activeCol, 0, "")
      }
    }
    ladGridCategory[index].splice(activeCol, 0, "Definition")
    ladCurActiveCol[index] = this.gConst.INVALID_COL

    this.ladGridData = ladGridData;
    this.ladGridCategory = ladGridCategory;
    this.ladCurActiveCol = ladCurActiveCol;
    this.bContentModified = true;
  }

  /**
   * insert a column to last
  */
  onInsertLADColumnLast = () => {
    let index = this.activeLADTab
    let ladGridData = [...this.ladGridData];
    let ladGridCategory = [...this.ladGridCategory];

    let colLength = ladGridData[index][0].length;
    let activeCol = ladGridData[index][0].length;

    ladGridData[index][0].splice(activeCol, 0, "");
    if (ladGridData[index].length > 1 && ladGridData[index][1].length == colLength) {
      for (let i = 1; i < ladGridData[index].length; i++) {
        ladGridData[index][i].splice(activeCol, 0, "");
      }
    }

    ladGridCategory[index].splice(activeCol, 0, "Definition");

    this.ladGridData = ladGridData;
    this.ladGridCategory = ladGridCategory;
    this.bContentModified = true;
  };

  /**
   * delete active column
   */
  onDeleteLADColumn = (): any => {
    let index = this.activeLADTab
    let ladGridCategory = Array.from(this.ladGridCategory)
    let ladGridData = Array.from(this.ladGridData)
    let ladCurActiveCol = Array.from(this.ladCurActiveCol)

    let colLength = ladGridData[index][0].length
    let activeCol = ladCurActiveCol[index] === this.gConst.INVALID_COL ? colLength - 1  : ladCurActiveCol[index];
    if(colLength === 1) return false;

    // console.log("onDeleteCPRColumn Last state: " + JSON.stringify(this.lastActionState.ladGridData))

    for (let i = 0; i < ladGridData[index].length; i++) {
      // for (let j = activeCol; j < colLength - 1; j++) {
      //   ladGridData[index][i][j] = ladGridData[index][i][j + 1] !== null ? ladGridData[index][i][j + 1] : ""
      // }
      // ladGridData[index][i].splice(colLength - 1, 1);
      ladGridData[index][i].splice(activeCol, 1);
    }

    // ladGridData[index][0].splice(activeCol, 1);
    // if (ladGridData[index].length > 1 && ladGridData[index][1].length === colLength) {
    //   for (let i = 1; i < ladGridData[index].length; i++) {
    //     ladGridData[index][i].splice(activeCol, 1);
    //   }
    // }

    ladGridCategory[index].splice(activeCol, 1);
    ladCurActiveCol[index] = this.gConst.INVALID_COL

    this.ladGridData = ladGridData;
    this.ladGridCategory = ladGridCategory;
    this.ladCurActiveCol = ladCurActiveCol;
    this.bContentModified = true;
  };

  onClearGridData = (index: number) => {
    let ladGridCategory = Array.from(this.ladGridCategory);
    let ladGridData = Array.from(this.ladGridData);
    ladGridCategory[index] = ['Label', 'Definition', 'Definition', 'Definition', 'Definition', 'Definition', 'Definition', 'Definition'];
    ladGridData[index] = Array(1).fill(Array(8).fill(''));
    this.ladGridCategory = ladGridCategory;
    this.ladGridData = ladGridData;
  }

  onEdit = () => {
    let UTCTimeStr = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    let ro = this.store.getCurrentRo();
    let body = { custRecAction: this.gConst.ACTION_UPDATE, srcNum: this.num, srcEffDtTm: UTCTimeStr, custRecCompPart: this.custRecCompPart }
    this.api.lockCadRec({body: JSON.stringify(body), ro: ro}).subscribe(res => {
      if (res) {
        if (res.updateStatus.isAllowed === 'Y') {
          this.lockParam = body;
          this.action = this.gConst.ACTION_UPDATE;

          this.disable = false;
          this.bEditEnable = false;
          this.bSubmitEnable = true;
          this.bSaveEnable = true;
          return
        }

        if (res.errList) {
          this.showError(gFunc.synthesisErrMsg(res.errList), 'Error');
        } else if (res.updateStatus && res.updateStatus.statusMessages !== null) {
          this.showError(gFunc.synthesisErrMsg(res.updateStatus.statusMessages), 'Error');
        }
      }
    })
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

  onCopy = () => {
    this.inputSrcNum = this.num;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtNum = gFunc.formattedNumber(this.num);
    this.inputTgtEffDtTm = ''
    this.inputCopyNow = false
    this.validMsg = ''
    this.bCheckCREnable = true
    this.bCheckCPREnable = true
    this.bCheckLADEnable = true
    this.portionEntire = false
    this.portionCR = false
    this.portionCPR = false
    this.portionLAD = false
    this.copyAction = this.gConst.COPYACTION_CHANGE
    this.copyModalVisible = true;
  }

  onTransfer = () => {
    this.inputSrcNum = this.num;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtNum = gFunc.formattedNumber(this.num);
    this.inputTgtEffDtTm = '';
    this.inputCopyNow = false;
    this.validMsg = '';
    this.bCheckCPREnable = true;
    this.bCheckLADEnable = true;
    this.portionEntire = false;
    this.portionCR = true;
    this.portionCPR = false;
    this.portionLAD = false;
    this.transferModalVisible = true;
  }

  toggleDelete = () => {
    this.deleteModalVisible = !this.deleteModalVisible;
  }

  onConvert = () => {
    this.inputSrcNum = this.num,
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtNum = '';
    this.inputTgtEffDtTm = '';
    this.inputCopyNow = false;
    this.validMsg = '';
    this.copyAction = this.gConst.COPYACTION_CONVERT;
    this.convertModalVisible = true;
  }

  onSubmit = () => {
    this.performAction('U')
  }

  onSave = () => {
    this.performAction('S')
  }

  performAction = (cmd: string) => {
    switch (this.action) {
      case this.gConst.ACTION_NONE:
      case this.gConst.ACTION_UPDATE:
        this.updateCustomerRecord(cmd)
        break
      case this.gConst.ACTION_CREATE:
        this.createCustomerRecord(cmd)
        break
      case this.gConst.ACTION_COPY:
        if (this.selectReferral === '')
          this.copyCustomerRecord(cmd)
        else
          this.disconnectCustomerRecord(cmd)
        break
      case this.gConst.ACTION_TRANSFER:
        this.transferCustomerRecord(cmd)
        break
      case this.gConst.ACTION_DISCONNECT:
        if (this.selectReferral === '') {
          this.inputMessage = 'Please select referral data'
          return
        }
        this.disconnectCustomerRecord(cmd)
        break
    }
  }

  onRevert = () => {

  }

  toggleCancel = () => {
    this.confirmationService.confirm({
      message: 'Are you sure you wish to cancel?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cancelAction();
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

  transferCustomerRecord = async (cmd: string) => {
    let body = await this.getTransferRequestBody(cmd)

    let res: any = await new Promise<any>(resolve=> {
      this.api.transferCadRec({'body': JSON.stringify(body), ro: this.inputRespOrg}).subscribe(res=>{
        resolve(res);
      });
    });
    
    if (res.success) {
      // let data = res
      // if (data.recVersionId != undefined && data.recVersionId != null) {
      //   this.recVersionId = data.recVersionId
      // }

      // if (data.recVersionId != null && data.effDtTm != null) {
      //   if (await this.retrieveCustomerRecord(body.tgtNum, data.effDtTm)) {

      //   }
      // }
    }
    return true
  }

  disconnectCustomerRecord = async (cmd: string) => {
    let body = await this.getDisconnectRequestBody(cmd)

    let res = await new Promise<any>(resolve=>{
      this.api.disconnectCadRec({'body': JSON.stringify(body), ro: this.inputRespOrg}).subscribe(res=>{
        resolve(res);
      });
    });
    
    if (res.success) {

    }
    return true
  }

  copyCustomerRecord = async (cmd: string) => {
    let body = await this.getCopyRequestBody(cmd)

    let res = await new Promise<any>(resolve=>{
      this.api.copyCadRec({'body': JSON.stringify(body), ro: this.inputRespOrg}).subscribe(res=>{
        resolve(res);
      });
    });
    
    if (res.success) {

    } else {

    } 
    return true;
  }

  createCustomerRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }

    let body: any = await this.getCreateRequestBody(cmd)

    let res: any = await new Promise<any>(resolve=>{
      this.api.createCadRec(JSON.stringify(body)).subscribe(res=>{
        resolve(res);
      })
    });

    if (res.success) {

    }

    return true;
  };

  updateCustomerRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }

    let body: any = await this.getUpdateRequestBody(cmd)

    let res = await new Promise<any>(resolve=>{
      this.api.updateCadRec(JSON.stringify(body)).subscribe(res=>{
        resolve(res)
      });
    });
    
    if (res.success) {

    } else if (res != undefined) {

    }

    return true
  }

  getCprSect = async () => {
    let cprSect: any[] = []

    // check if there are all blank cpr data
    let blank = true
    for (let grid of this.cprGridData) {
      for (let row of grid) {
        for (let cell of row) {
          if (cell != null && cell !== "") {
            blank = false
            break
          }
        }

        if (!blank) break
      }

      if (!blank) break
    }

    if (blank === true) {
      return cprSect
    }

    for (let index = 0; index < this.cprSectNames.length; index++) {

      let name = this.cprSectNames[index]

      // config node seq and nodes
      let gridData = JSON.parse(JSON.stringify(this.cprGridData[index]))

      let nodeSeq = [...this.cprGridCategory[index]]
      let colIndex = nodeSeq.length - 1
      while (colIndex >= 0) {
        if (nodeSeq[colIndex] === undefined || nodeSeq[colIndex] === '') {
          nodeSeq.splice(colIndex, 1)
          for (let i = 0; i < gridData.length; i++)
            gridData[i].splice(colIndex, 1)
        }
        colIndex--
      }

      // config nodes
      let nodes = []
      for (let i = 0; i < gridData.length; i++) {
        let row = gridData[i]
        if (row.join("") === '') continue

        for (let j = 0; j < row.length; j++) {
          let cell = row[j]

          let values = []
          if (cell !== undefined && cell != null && cell !== "")
            values.push(cell)

          let node = {rowIndex: i + 1, colIndex: j + 1, values: values}
          nodes.push(node)
        }
      }

      let cprItem = {name: name, nodeSeq: nodeSeq, nodes: nodes}
      cprSect.push(cprItem)
    }

    return cprSect
  }

  getLabelData = async () => {
    let ladSect: any[] = [];
    let lblVals: any[] = [];
    let lblName = '';
    this.ladGridData.forEach((item, index)=>{
      switch(index) {
        case 8:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_SD,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 2:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_LT,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 1:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_DT,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 0:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_AC,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 3:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_NX,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 4:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_ST,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 5:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_TE,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 6:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_TI,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
        case 7:
          lblVals = [];
          item.forEach((val: any, i: number)=>{
            if(val[0] != '' || i == item.length-1) {
              if(i == item.length-1) {
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
              if(i!=0) {
                ladSect.push(
                  {
                    lblType: LBL_TYPE_TD,
                    lblName: lblName,
                    lblVals: lblVals
                  }
                );
              }
              lblVals = [];
              if(i != item.length-1) {
                lblName = val[0];
                lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
              }
            } else {
              lblVals = [...lblVals, ...(val.slice(1, 8).filter((h: string)=>h!=''))];
            }
          });
          break;
      }
    });

    return ladSect
  }

  getCommonRequestBody = async (cmd: string) => {

    let cprSectName = await this.getCprSect()
    let lblList = await this.getLabelData()

    let priIntraLT = this.selectPriIntraLT
    let priInterLT = this.selectPriInterLT

    let intraLATACarrier: any[] = []
    if (this.selectIntraLATACarrier !== '') {
      intraLATACarrier = this.selectIntraLATACarrier?.replace(/\ /g, "").split(",")
    }

    let interLATACarrier: any[] = []
    if (this.selectInterLATACarrier !== '') {
      interLATACarrier = this.selectInterLATACarrier?.replace(/\ /g, "").split(",")
    }

    let aos: any = {}
    let aosNet = this.inputNetwork
    if (aosNet != '')
      aos.aosNet = aosNet?.replace(/\ /g, "").split(",")
    else
      aos.aosNet = []

    let aosState = this.inputState
    if (aosState != '')
      aos.aosState = aosState?.replace(/\ /g, "").split(",")
    else
      aos.aosState = []

    let aosNPA = this.inputNpa
    if (aosNPA != '')
      aos.aosNPA = aosNPA?.replace(/\ /g, "").split(",")
    else
      aos.aosNPA = []

    let aosLATA = this.inputLata
    if (aosLATA != '')
      aos.aosLATA = aosLATA?.replace(/\ /g, "").split(",")
    else
      aos.aosLATA = []

    let aosLbl = this.inputLabel
    if (aosLbl != '')
      aos.aosLbl = aosLbl?.replace(/\ /g, "").split(",")
    else
      aos.aosLbl = []

    let destNums = []
    for (let el of this.destNums) {
      if (el.destNum === '' && el.numTermLine === '' && el.localServOff === '' && el.forServOff === '') {
        continue
      }

      let destNum: any = {}
      if (el.destNum !== '')           destNum.destNum = el.destNum?.replace(/\-/g, "")
      if (el.numTermLine !== '')       destNum.numTermLine = el.numTermLine
      if (el.localServOff !== '')      destNum.localServOff = el.localServOff
      if (el.forServOff !== '')        destNum.forServOff = el.forServOff

      destNums.push(destNum)
    }

    let body: any = {
      cmd: cmd,
      priority: this.inputPriority ? 'Y' : 'N',
      telco: this.inputTelco,
      hldIndFlag: this.selectHold,
      destNums: destNums,
      aos: aos,
      dayLightSavings: this.inputDayLightSaving ? 'Y' : 'N',
    }

    // if (this.state.customerId !== '')
    //   body.onAccCust = this.state.customerId
    //
    // if (this.state.agent !== '')
    //   body.agent = this.state.agent

    if (this.inputEndSub !== '')
      body.endSub = this.inputEndSub

    if (this.inputEndSubAddr !== '')
      body.endSubAddr = this.inputEndSubAddr

    if (this.inputSvcOrderNum !== '')
      body.inputSvcOrderNum = this.inputSvcOrderNum

    if (this.inputSuppFormNum !== '')
      body.inputSuppFormNum = this.inputSuppFormNum

    if (this.inputContactName !== '')
      body.conName = this.inputContactName

    if (this.inputContactNumber !== '')
      body.conTel = this.inputContactNumber?.replace(/\-/g, "")

    if (this.inputNotes !== '')
      body.notes = this.inputNotes

    if (intraLATACarrier.length)
      body.intraLATACarrier = intraLATACarrier
    else
      body.intraLATACarrier = []

    if (interLATACarrier.length)
      body.interLATACarrier = interLATACarrier
    else
      body.interLATACarrier = []

    if (cprSectName.length)
      body.cprSectName = cprSectName
    else
      body.cprSectName = []

    if (lblList.length)
      body.lbl = lblList
    else
      body.lbl = []

    if (priIntraLT != null && priIntraLT !== '')
      body.priIntraLT = priIntraLT

    if (priInterLT != null && priInterLT !== '')
      body.priInterLT = priInterLT

    if (this.selectTimezone != null && this.selectTimezone != '')
      body.tmZn = this.selectTimezone
    return body
  }

  getUpdateRequestBody = async (cmd: string) => {
    let body: any = await this.getCommonRequestBody(cmd)
    body.num = this.num
    body.effDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    if (this.inputEndIntDtTm !== '')
      body.endInterceptDt = gFunc.fromTimeValueToUTCDateStr(new Date(this.inputEndIntDtTm))
    if (this.selectReferral !== '')
      body.referral = this.selectReferral
    body.recVersionId = this.recVersionId
    return body
  }

  getCreateRequestBody = async (cmd: string) => {
    let body: any = await this.getCommonRequestBody(cmd)
    body.num = this.num

    let effDtTm = "NOW"
    if (!this.inputCreateNow)
      effDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputCreateEffDtTm))
    body.effDtTm = effDtTm

    body.newRespOrgId = this.inputRespOrg

    return body
  }

  getCopyRequestBody = async (cmd: string) => {

    let body: any = await this.getCommonRequestBody(cmd)

    body.srcNum = this.inputSrcNum
    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)
    body.srcRecVersionId = this.srcRecVersionId

    body.tgtNum = this.num
    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    body.tgtRecVersionId = this.recVersionId

    // configs component part
    body.custRecCompPart = this.lockParam.custRecCompPart
    body.overWriteTGT = 'Y'

    return body
  }

  getDisconnectRequestBody = async (cmd: string) => {
    let body: any = await this.getCommonRequestBody(cmd)

    body.srcNum = this.inputSrcNum
    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)
    body.srcRecVersionId = this.srcRecVersionId

    body.tgtNum = this.num
    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    if (this.inputEndIntDtTm !== '')
      body.endInterceptDt = gFunc.fromTimeValueToUTCDateStr(new Date(this.inputEndIntDtTm))
    if (this.selectReferral !== '')
      body.referral = this.selectReferral

    // configs component part
    let custRecCompPart = ''
    if (this.portionCR) {   // entire components
      custRecCompPart = "CAD"
    }

    if (this.portionLAD) {
      custRecCompPart += (custRecCompPart == '') ? '' : ', '
      custRecCompPart += "LAD"
    }

    if (this.portionCPR) {
      custRecCompPart += (custRecCompPart == '') ? '' : ', '
      custRecCompPart += "CPR"
    }

    body.custRecCompPart = custRecCompPart
    body.overWriteTGT = 'Y'

    return body
  }

  getTransferRequestBody = async (cmd: string) => {
    let body: any = await this.getCommonRequestBody(cmd)

    body.srcNum = this.inputSrcNum
    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)
    body.srcRecVersionId = this.srcRecVersionId

    body.tgtNum = this.num
    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    body.tgtRecVersionId = this.recVersionId

    if (this.inputEndIntDtTm !== '')
      body.endInterceptDt = gFunc.fromTimeValueToUTCDateStr(new Date(this.inputEndIntDtTm))
    if (this.selectReferral !== '')
      body.referral = this.selectReferral

    body.custRecCompPart = this.lockParam.custRecCompPart
    body.overWriteTGT = 'Y'

    return body
  }

  checkValidation = () => {
    // console.log("this.createEffDtTm: " + this.inputCreateEffDtTm)

    let message = ''

    if (this.inputRespOrg === '') {
      message += 'Resp Org field is required.'
    }

    if (this.action === this.gConst.ACTION_CREATE && !this.inputCreateNow) {
      if (this.inputCreateEffDtTm === 0 || this.inputCreateEffDtTm === '') {
        message += (message === '') ? '' : '\r\n'
        message += 'Effective Date Time field is required.'
      }
    }

    if (this.inputNetwork === '' && this.inputState === '' && this.inputNpa === '' && this.inputLata === '' && this.inputLabel === '') {
      message += (message === '') ? '' : '\r\n'
      message += 'At least one field of the Area of Service is required.'
    }

    if (this.selectIntraLATACarrier === '' || this.selectInterLATACarrier === '') {
      message += (message === '') ? '' : '\r\n'
      message += 'Intra and Inter Carriers are required.'
    }

    if (message != '') {
      this.inputMessage = message
      return false
    }
    return true
  }

  /**
   * get copy & paste value
   */
  getCopyPasteValue = (ev: any) => {
    let cprGridData = [...this.cprGridData];
    let [ row, col ] = ev.target.name.split("_");

    let values = (ev.target as HTMLInputElement).value.split(" ");
    values.map(items => {
      let item = items.split("\t");
      if(item.length > 1) {
        item.map(cpr => {
          if(!cprGridData[row]) {
            cprGridData.push(Array(8).fill(''));
          }
          cprGridData[row][col] = cpr;
          col++
        })
        row++; col = 0;
      }
    })

    return cprGridData;
  }

  getLADCopyPasteValue = (ev: any, row: number, col: number) => {
    let ladGridData = [...this.ladGridData];

    let values = (ev.target as HTMLInputElement).value.split(" ");
    values.map(items => {
      let item = items.split("\t");
      if(item.length > 1) {
        item.map(lad => {
          if(!ladGridData[row]) {
            ladGridData.push(Array(8).fill(''));
          }
          ladGridData[row][col] = lad;
          col++
        })
        row++; col = 0;
      }
    })

    return ladGridData;
  }

  checkDataExistForCPR = () => {
    // check if the CPR data exists
    let bExistCPR = false
    if (this.selectPriIntraLT !== this.initialState.selectPriIntraLT)             bExistCPR = true
    if (this.selectPriInterLT !== this.initialState.selectPriInterLT)             bExistCPR = true
    if (this.selectTimezone !== this.initialState.selectTimezone)                 bExistCPR = true
    if (this.inputDayLightSaving !== this.initialState.inputDayLightSaving)     bExistCPR = true
    if (this.cprSectNames.length)                                     bExistCPR = true

    this.noCPR = !bExistCPR;
  }

  checkDataExistForCR = () => {

    // check if the CR data exists
    let bExistCR = false
    let bExistNetworks = false, bExistStates = false, bExistNPAs = false, bExistLATAs = false, bExistLabels = false
    let bExistIAC = false, bExistIEC = false

    if (this.action === this.gConst.ACTION_CREATE) {
      if (Boolean(this.inputCreateEffDtTm))
        bExistCR = true

      if (!bExistCR && this.inputCreateNow)                bExistCR = true
      if (!bExistCR && this.inputRespOrg !== '')           bExistCR = true
    }

    if (!bExistCR && this.inputPriority)                   bExistCR = true
    if (!bExistCR && this.inputCustomerId !== '')          bExistCR = true
    if (!bExistCR && this.inputAgent !== '')               bExistCR = true
    if (!bExistCR && this.inputTelco !== '')               bExistCR = true
    if (!bExistCR && this.selectHold !== 'N')               bExistCR = true

    if (!bExistCR && this.inputEndSub !== '')             bExistCR = true
    if (!bExistCR && this.inputEndSubAddr !== '')         bExistCR = true
    if (!bExistCR && this.inputSvcOrderNum !== '')        bExistCR = true
    if (!bExistCR && this.inputSuppFormNum !== '')        bExistCR = true

    if (!bExistCR) {
      for (let el of this.destNums) {
        if (el.destNum !== '' || el.numTermLine !== '' || el.localServOff !== '' || el.forServOff !== '') {
          bExistCR = true
          break
        }
      }
    }

    if (!bExistCR && this.inputContactName !== '')         bExistCR = true
    if (!bExistCR && this.inputContactNumber !== '')       bExistCR = true
    if (!bExistCR && this.inputNotes !== '')               bExistCR = true

    if (!bExistCR && (this.inputEndIntDtTm !== '' || this.inputEndIntDtTm != null))          bExistCR = true
    if (!bExistCR && this.selectReferral !== '')            bExistCR = true

    if (this.inputNetwork !== '') {
      bExistCR = true
      bExistNetworks = true
    }
    if (this.inputState !== '') {
      bExistCR = true
      bExistStates = true
    }
    if (this.inputNpa !== '') {
      bExistCR = true
      bExistNPAs = true
    }
    if (this.inputLata !== '') {
      bExistCR = true
      bExistLATAs = true
    }
    if (this.inputLabel !== '') {
      bExistCR = true
      bExistLabels = true
    }
    if (this.selectIntraLATACarrier !== '') {
      bExistCR = true
      bExistIAC = true
    }
    if (this.selectInterLATACarrier !== '') {
      bExistCR = true
      bExistIEC = true
    }

    this.noCR = !bExistCR,
    this.noNetworks = !bExistNetworks,
    this.noStates = !bExistStates,
    this.noNPAs = !bExistNPAs,
    this.noLATAs = !bExistLATAs,
    this.noLabels = !bExistLabels,
    this.noIAC = !bExistIAC,
    this.noIEC = !bExistIEC
  }

  setLADActiveIndexes = (index: number, row: number, cell: number) => {
    let ladCurActiveRow = [...this.ladCurActiveRow]
    let ladCurActiveCol = [...this.ladCurActiveCol]

    ladCurActiveRow[index] = row
    ladCurActiveCol[index] = cell

    this.ladCurActiveRow = ladCurActiveRow;
    this.ladCurActiveCol = ladCurActiveCol;
  }

  handleLADCellChange = (event: Event, index: number, row: number, col: number) => {
    let ladGridData = [...this.ladGridData]

    if((event.target as HTMLInputElement).value.includes("\t")) {
      ladGridData[index] = this.getLADCopyPasteValue(event, row, col)
      this.ladGridData = ladGridData;
    } else {
      ladGridData[index] = gFunc.handle_value_lad(event, this.ladGridData[index], row, col)
      this.ladGridData = ladGridData;
    }

    this.bContentModified = true;
    //this.checkDataExistForCPR() // do not call because no need
  }

  closeCopyModal = () => {
    this.copyModalVisible = false;
  }

  checkValidForCopying = async () => {
    if (!this.inputCopyNow && !Boolean(this.inputTgtEffDtTm)) {
      this.showWarn("Please input effective date/time");
      return
    }

    let srcNum = this.inputSrcNum?.replace(/\-/g, "")
    let tgtNum = this.inputTgtNum?.replace(/\-/g, "")
    let tgtTmplName = this.inputTgtNum

    switch (this.copyAction) {
      case this.gConst.COPYACTION_CHANGE:
        break
      case this.gConst.COPYACTION_DISCONNECT:
        if (srcNum !== tgtNum) {
          this.showWarn("Copy of a Disconnect TR is allowed only to the same Number");
          return
        }
        if (this.selectReferral !== '') {
          this.showWarn("Action must be Change or New");
          return
        }
        break
      case this.gConst.COPYACTION_NEW:
        if (srcNum === tgtNum) {
          this.showWarn("Action must be Change or Disconnect")
          return
        }
        break
    }

    if (!this.portionCR && !this.portionCPR && !this.portionLAD) {
      this.showWarn("Select at least one checkbox")
      return
    }

    // gets source date time
    let srcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      tgtEffDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputTgtEffDtTm))
      // let d = new Date(this.inputTgtEffDtTm).getTime();
      // tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    // configs component part
    let custRecCompPart = ''
    if (this.portionCR) {   // basic
      custRecCompPart = "CAD"
    }

    // LAD data
    if (this.portionLAD) {
      custRecCompPart += (custRecCompPart == '') ? '' : ', '
      custRecCompPart += "LAD"
    }

    // CPR data
    if (this.portionCPR) {
      custRecCompPart += (custRecCompPart == '') ? '' : ', '
      custRecCompPart += "CPR"
    }

    let custRecAction = this.gConst.ACTION_COPY
    if (this.selectReferral !== '' || this.copyAction === this.gConst.COPYACTION_DISCONNECT) {
      custRecAction = this.gConst.ACTION_DISCONNECT
    }

    let regNum = this.gConst.TFNUM_REG_EXP
    let regTmpl = this.gConst.TMPLNAME_REG_EXP
    if (!regNum.test(tgtNum) && !regTmpl.test(tgtTmplName)) {
      this.showWarn("Invalid target toll-free number/template name");
      return
    }

    let ro = this.store.getCurrentRo();
    // configs parameter for calling lock api
    let body: any = {
      custRecAction: custRecAction,
      overWriteTGT: 'Y',
      srcNum: srcNum,
      srcEffDtTm: srcEffDtTm,
      tgtEffDtTm: tgtEffDtTm,
      custRecCompPart: custRecCompPart
    }

    if (regNum.test(tgtNum)) {
      body.tgtNum = tgtNum
    } else {
      body.tgtTmplName = tgtTmplName
    }

    // calls lock api
    let res: any = await this.api.lockCadRec({body: JSON.stringify(body), ro: ro})
    if (res) {
      if ((res.copyStatus && res.copyStatus.isAllowed === 'Y')
        || (res.disconnectStatus && res.disconnectStatus.isAllowed === 'Y')) {

          this.srcRecVersionId = this.recVersionId;
          this.lockParam = body;

        // if the copy from cad to tad
        if (regTmpl.test(tgtTmplName)) {

          let params = { tmplName: tgtTmplName, ro: ro, isUserAct: false }
          // get template info
          let resTmplQuery = await new Promise<any>(resolve=> {
            this.api.queryCadlRec(params).subscribe(res=> {
              resolve(res);
            });
          });

          if (resTmplQuery) {
            let data = resTmplQuery
            if (data.lstEffDtTms && data.lstEffDtTms.length > 0) {
              // find the template record before than target date time
              let i = data.lstEffDtTms.length - 1
              for (; i >= 0; i++) {
                let el = data.lstEffDtTms[i]
                if (el.effDtTm <= tgtEffDtTm) {
                  break
                }
              }

              // retrieve the template record with template name and effective date time
              let tmplEffDtTm: string = data.lstEffDtTms[i].effDtTm?.replace(/\-/g, "")?.replace(":", "")
              let params_retrieve = { tmplName: tgtTmplName, effDtTm: tmplEffDtTm, ro: ro }
              let resTmpl = await new Promise<any>(resolve=> {
                this.api.tmplAdminDataRetrieve(ro, params_retrieve.tmplName, params_retrieve.effDtTm).subscribe(res=> {
                  resolve(res);
                });
              });
              
              if (resTmpl) {

                let data = resTmpl
                this.tgtRetrieveData = data;

                let bOverwrite = false

                if (data.effDtTm === this.lockParam.tgtEffDtTm) {
                  // if cpr data of target template record exits, should overwrite.
                  if (this.portionCPR && data.cprSectName && data.cprSectName.length)
                    bOverwrite = true

                  // if lad data of target template record exits, should overwrite.
                  if (this.portionLAD && data.lbl && data.lbl.length)
                    bOverwrite = true
                }

                if (bOverwrite) {
                  // asks the user if will overwrite.
                  //confirm dialog
                  this.actionOverwrite();

                } else {  // if no overwrite
                  this.gotoTADPage(this.gConst.CADTOTADTYPE_EXIST)
                }
              }
            }
          }
          return
        }

        let utcTgtEffDtTm = body.tgtEffDtTm
        if (utcTgtEffDtTm === "NOW")
          utcTgtEffDtTm = gFunc.getUTCString(new Date())

        // if create record
        if (body.srcNum !== body.tgtNum) {
          await this.retrieveNumForTgtNum(body.tgtEffDtTm)
          return
        }

        let nextUtcEffDtTm = ""
        let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)
        if (index + 1 < this.effDtTmStatList.length)
          nextUtcEffDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index + 1])

        // if target date time is future than current record date time, no need to retrieve
        let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
        if (utcEffDtTm < utcTgtEffDtTm) {

          // if next effective date time is selected, retrieve next.
          if (nextUtcEffDtTm === utcTgtEffDtTm) {
            await this.retrieveNumForTgtNum(nextUtcEffDtTm)
            return
          }

          if (!this.portionCPR) // if no select for the CPR, initialize the CPR
            this.initCPRData()

          if (!this.portionLAD) // if no select for the LAD, initialize the LAD
          this.ladGridData = Array(9).fill('').map(dd=>([]));

        } else { // if target date time is before than current record date time, should retrieve the before record.
          let effDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index - 1])
          await this.retrieveNumForTgtNum(effDtTm)
          return
        }

        let effDtTmStat = "NOW"
        if (body.tgtEffDtTm != "NOW")
          effDtTmStat = gFunc.fromUTCStrToCTStr(body.tgtEffDtTm)
        let effDtTmStatList = [effDtTmStat]

        this.effDtTmStatList = effDtTmStatList;
        this.selectEffDtTmStat = effDtTmStat;
        this.num = body.tgtNum;

        this.finishCpyTrnsfrOp()

        return
      }

      if (res.errList) {
        this.showError(gFunc.synthesisErrMsg(res.errList), 'Error');
      } else if (res.copyStatus && res.copyStatus.statusMessages !== null) {
        this.showError(gFunc.synthesisErrMsg(res.copyStatus.statusMessages), 'Error');
      } else if (res.disconnectStatus && res.disconnectStatus.statusMessages !== null) {
        this.showError(gFunc.synthesisErrMsg(res.disconnectStatus.statusMessages), 'Error');
      }
    }
  }

  checkValidForConverting = async () => {
    // gets the template name
    if (!Boolean(this.inputTgtTmplName)) {
      this.showWarn('Please input template name');
      return
    }

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      if (!Boolean(this.inputTgtEffDtTm)) {
        this.showWarn('Please input effective date/time');
        return
      }
      tgtEffDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputTgtEffDtTm))
      // let d = new Date(this.inputTgtEffDtTm).getTime();
      // tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    this.convertCustomerRecord()
  }

  actionOverwrite = () => {
    if (this.tgtRetrieveData.tmplId) {
      this.gotoTADPage(this.gConst.CADTOTADTYPE_EXIST)
    } else {
      this.migrateSurAndTgtCad()
    }
  }

  gotoTADPage = async (cadToTadType: string) => {
    const cookies = new Cookies();

    this.store.storeCadState(JSON.stringify({
      selectRo: this.store.getCurrentRo(),
      retrieveCardTitle: this.retrieveCardTitle,
      resultCardTitle: this.resultCardTitle,
      bExpRetrieve: this.bExpRetrieve,
      bExpResult: this.bExpResult,
      bRetrieveCardIconHidden: this.bRetrieveCardIconHidden,
      searchNum:                this.inputSearchNum,
      searchEffDtTm:            this.inputSearchEffDtTm,
      bResultHeaderHidden:      this.bResultHeaderHidden,
      bEffDtTmListHidden:       this.bEffDtTmListHidden,
      bEffDtTmDisable:          this.bEffDtTmDisable,
      numParam:                 this.numParam,
      effDtTmParam:             this.effDtTmParam,
      preEffDtTmStat:           this.preEffDtTmStat,
      action:                   this.action,
      disable:                  this.disable,
      effDtTmStat:              this.selectEffDtTmStat,
      effDtTmStatList:          this.effDtTmStatList,
      status:                   this.status,
      num:                      this.num,
      activeMainTab:            this.activeMainTab,
      activeAOSTab:             this.activeAOSTab,
      activeCarrierTab:         this.activeCarrierTab,
      activeCPRTab:             this.activeCPRTab,
      activeLADTab:             this.activeLADTab,
      bContentModified:         this.bContentModified,
      bRetrieveEnable:          this.bRetrieveEnable,
      bEditEnable:              this.bEditEnable,
      bCopyEnable:              this.bCopyEnable,
      bTransferEnable:          this.bTransferEnable,
      bDeleteEnable:            this.bDeleteEnable,
      bSubmitEnable:            this.bSubmitEnable,
      bSaveEnable:              this.bSaveEnable,
      bRevertEnable:            this.bRevertEnable,
      bCancelEnable:            this.bCancelEnable,
      message:                  this.inputMessage,
      noCR:                     this.noCR,
      noCPR:                    this.noCPR,
      noLAD:                    this.noLAD,
      srcNum:                   this.inputSrcNum,
      srcEffDtTm:               this.inputSrcEffDtTm,
      srcRecVersionId:          this.srcRecVersionId,
      tgtNum:                   this.inputTgtNum,
      tgtTmplName:              this.inputTgtTmplName,
      tgtEffDtTm:               this.inputTgtEffDtTm,
      copyNow:                  this.inputCopyNow,
      copyAction:               this.copyAction,
      portionEntire:            this.portionEntire,
      portionCR:                this.portionCR,
      portionCPR:               this.portionCPR,
      portionLAD:               this.portionLAD,
      bCheckCPREnable:          this.bCheckCPREnable,
      bCheckLADEnable:          this.bCheckLADEnable,
      tgtRetrieveData:          this.tgtRetrieveData,
      lockParam:                this.lockParam,
      createEffDtTm:            this.inputCreateEffDtTm,
      createNow:                this.inputCreateNow,
      respOrg:                  this.inputRespOrg,
      priority:                 this.inputPriority,
      customerId:               this.inputCustomerId,
      agent:                    this.inputAgent,
      telco:                    this.inputTelco,
      hold:                     this.selectHold,
      endSub:                   this.inputEndSub,
      endSubAddr:               this.inputEndSubAddr,
      svcOrderNum:              this.inputSvcOrderNum,
      suppFormNum:              this.inputSuppFormNum,
      lastUpDt:                 this.inputLastUpDt,
      approval:                 this.inputApproval,
      lastUser:                 this.inputLastUser,
      prevUser:                 this.inputPrevUser,
      destNums:                 this.destNums,
      contactName:              this.inputContactName,
      contactNumber:            this.inputContactNumber,
      notes:                    this.inputNotes,
      endIntDtTm:               this.inputEndIntDtTm,
      referral:                 this.selectReferral,
      network:                  this.inputNetwork,
      state:                    this.inputState,
      npa:                      this.inputNpa,
      lata:                     this.inputLata,
      label:                    this.inputLabel,
      noNetworks:               this.noNetworks,
      noStates:                 this.noStates,
      noNPAs:                   this.noNPAs,
      noLATAs:                  this.noLATAs,
      noLabels:                 this.noLabels,
      noIAC:                    this.noIAC,
      noIEC:                    this.noIEC,
      interLATACarrier:         this.selectInterLATACarrier,
      intraLATACarrier:         this.selectIntraLATACarrier,
      choiceModalList:          this.choiceModalList,
      choiceList:               this.choiceList,
      npaChoiceModalList:       this.npaChoiceModalList,
      npaChecked:               this.npaChecked,
      npaExpanded:              this.npaExpanded,
      recVersionId:             this.recVersionId,
      custRecCompPart:          this.custRecCompPart,
      iac_array: this.iac_array,
      iec_array: this.iec_array,
      priIntraLT: this.selectPriIntraLT,
      priInterLT: this.selectPriInterLT,
      timezone: this.selectTimezone,
      dayLightSaving: this.inputDayLightSaving,
      npaCntPerCarrier: this.inputNpaCntPerCarrier,
      /*********************************** CPR Data ***********************************/
      cprSectNames: this.cprSectNames,
      cprGridCategory: this.cprGridCategory,
      cprGridData: this.cprGridData,
      cprCurActiveRow: this.cprCurActiveRow,
      cprCurActiveCol: this.cprCurActiveCol,
      cprSectNameModalVisible: false,
      /*********************************** LAD Data ***********************************/
      ladGridCategory: this.ladGridCategory,
      ladGridData: this.ladGridData,
      ladSectNames: this.ladSectNames,
    }));
    cookies.set(this.gConst.CADTOTADTYPE_COOKIE_NAME, cadToTadType)

    this.router.navigateByUrl(ROUTES.templateAdmin.tad);
    // this.setState(JSON.parse(JSON.stringify(this.initialState)));
  }

  /**
   * migrate the source record and target record.
   */
  migrateSurAndTgtCad = async () => {

    // retrieve the target record data
    await this.reflectDataOnPage(this.lockParam.tgtNum, this.tgtRetrieveData)

    let effDtTmStat = "NOW"
    if (this.lockParam.tgtEffDtTm != "NOW")
      effDtTmStat = gFunc.fromUTCStrToCTStr(this.lockParam.tgtEffDtTm)
    let effDtTmStatList = [effDtTmStat]
    this.selectEffDtTmStat = effDtTmStat;
    this.effDtTmStatList = effDtTmStatList;

    // if target effective date time is different from retrieved effective date time
    // that means we should take only CR data from retrieved record and take CPR or LAD from original record.
    if (this.lockParam.tgtEffDtTm !== this.tgtRetrieveData.effDtTm) {

      // for the cpr data,
      if (!this.portionCPR) {
        this.initCPRData() // initialize the cpr data because no selection for CPR
      }

      // for the lad data,
      if (!this.portionLAD) {
        this.ladGridData = Array(9).fill('').map(dd=>([])); // initialize the LAD data because no selection for LAD
      }
    }

    // for the cpr data,
    if (this.portionCPR) {
      this.checkDataExistForCPR()
    }

    // for the lad data,
    if (this.portionLAD) {
      // overwrite the data
    }

    this.finishCpyTrnsfrOp()
  }

  finishCpyTrnsfrOp = () => {
    let action = this.gConst.ACTION_TRANSFER
    let message = this.gConst.TRANSFER_PENDING_MSG
    switch (this.lockParam.custRecAction) {
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

  /**
   * retrieve target record that is set on the copy modal or transfer modal
   * effDtTm : effective date time to retrieve
   */
  retrieveNumForTgtNum = (effDtTm: string) => {

    let params = { num: this.lockParam.tgtNum, effDtTm: effDtTm?.replace(/[-|:]/g, ''), isUserAct: false }
    // console.log("retrieveNumForTgtNum: " + params.num + ", " + params.effDtTm)

    this.api.retrieveCadRec(this.store.getCurrentRo(), params.num, params. effDtTm).subscribe(res => {
      if (res) {

        let data = res
        this.tgtRetrieveData = data

        let bOverwrite = false

        if (res.effDtTm === this.lockParam.tgtEffDtTm) {

          // if cpr data of target record exits, should overwrite.
          if (this.portionCPR && data.cprSectName && data.cprSectName.length)
            bOverwrite = true

          // if lad data of target record exits, should overwrite.
          if (this.portionLAD && data.lbl && data.lbl.length)
            bOverwrite = true

        }

        if (bOverwrite) {
          // asks the user if will overwrite.
          // overwriteModalVisible: true
          this.actionOverwrite();
        } else {  // if no overwrite
          this.migrateSurAndTgtCad()
        }

        return
      }

      // if no result, create new record
      this.createNewCadRecBasedOnSource()

    })
  }

  /**
   * create new record based on source record
   */
  createNewCadRecBasedOnSource = () => {

    let effDtTmStat = "NOW"
    if (this.lockParam.tgtEffDtTm != "NOW")
      effDtTmStat = gFunc.fromUTCStrToCTStr(this.lockParam.tgtEffDtTm)
    let effDtTmStatList = [effDtTmStat]

    // if not selected CPR, init CPR data
    if (!this.portionCPR) {
      this.initCPRData()
    }

    // if not selected LAD, init LAD data
    if (!this.portionLAD) {
      // this.initLADGrids()
      this.ladGridData = Array(9).fill('').map(dd=>([]));
    }

    let retrieveCardTitle = "Create a New Customer Record: " + this.lockParam.tgtNum

    this.effDtTmStatList = effDtTmStatList;
    this.selectEffDtTmStat = effDtTmStat;
    this.num = this.lockParam.tgtNum;
    this.retrieveCardTitle = retrieveCardTitle;

    this.finishCpyTrnsfrOp()
  }

  checkValidForTransferring = async () => {
    if (!this.inputCopyNow && this.inputTgtEffDtTm === '') {
      this.showWarn("Please input effective date/time")
      return
    }

    let srcNum = this.inputSrcNum?.replace(/\-/g, "")
    let tgtNum = this.inputTgtNum?.replace(/\-/g, "")
    let tgtTmplName = this.inputTgtNum

    // gets source date time
    let srcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      tgtEffDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputTgtEffDtTm))
      // let d = new Date(this.inputTgtEffDtTm).getTime();
      // tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    // configs component part
    let custRecCompPart = ''
    if (this.portionEntire) {   // entire components
      custRecCompPart = "CAD"
      if (!this.noLAD) {
        custRecCompPart += ", LAD"
      }
      if (!this.noCPR) {
        custRecCompPart += ", CPR"
      }

    } else {                        // individual components (CPR or LAD or CPR, LAD)
      if (this.portionLAD) {
        custRecCompPart += (custRecCompPart == '') ? '' : ', '
        custRecCompPart += "LAD"
      }
      if (this.portionCPR) {
        custRecCompPart += (custRecCompPart == '') ? '' : ', '
        custRecCompPart += "CPR"
      }
    }

    let regNum = this.gConst.TFNUM_REG_EXP
    let regTmpl = this.gConst.TMPLNAME_REG_EXP
    if (!regNum.test(tgtNum) && !regTmpl.test(tgtTmplName)) {
      this.showWarn("Invalid target toll-free number/template name")
      return
    }

    let ro = this.store.getCurrentRo();
    // configs parameter for calling lock api
    let body: any = {
      custRecAction: this.gConst.ACTION_TRANSFER,
      overWriteTGT: 'Y',
      srcNum: this.inputSrcNum,
      srcEffDtTm: srcEffDtTm,
      tgtEffDtTm: tgtEffDtTm,
      custRecCompPart: custRecCompPart
    }

    if (regNum.test(tgtNum)) {
      body.tgtNum = tgtNum
    } else {
      body.tgtTmplName = tgtTmplName
    }

    // calls lock api
    let res = await new Promise<any>(resolve=>{
      this.api.lockCadRec({body: JSON.stringify(body), ro: ro}).subscribe(res=>{resolve(res)});
    });
    if (res) {
      if (res.transferStatus.isAllowed === 'Y') {
        this.srcRecVersionId = this.recVersionId
        this.lockParam = body

        // if the copy from cad to tad
        if (regTmpl.test(tgtTmplName)) {

          let params_queryTmplRec = {tmplName: tgtTmplName, ro: ro}
          let resTmplQuery = await new Promise<any>(resolve=>{
            // get template info
            this.api.queryCadlRec(params_queryTmplRec).subscribe(res=>{resolve(res)});
          });
          if (resTmplQuery) {

            let data = resTmplQuery
            if (data.errList[0].errCode === "540001") { // Record does not exist
              this.gotoTADPage(this.gConst.CADTOTADTYPE_NEW)
              return
            } else if (data.lstEffDtTms && data.lstEffDtTms.length > 0) {

              // find the template record before than target date time
              let i = data.lstEffDtTms.length - 1
              for (; i >= 0; i++) {
                let el = data.lstEffDtTms[i]
                if (el.effDtTm <= tgtEffDtTm) {
                  break
                }
              }

              // retrieve the template record with template name and effective date time
              let tmplEffDtTm = data.lstEffDtTms[i].effDtTm?.replace(/\-/g, "").replace(":", "")
              let params_retrieveTmplRec = { tmplName: tgtTmplName, effDtTm: tmplEffDtTm, ro: ro }
              let resTmpl = await new Promise<any>(resolve=>{
                this.api.tmplAdminDataRetrieve(this.store.getCurrentRo(), params_retrieveTmplRec.tmplName, params_retrieveTmplRec.effDtTm).subscribe(res=>{resolve(res)});
              });
              
              if (resTmpl) {

                let data = resTmpl
                this.tgtRetrieveData = data

                let bOverwrite = false

                if (data.effDtTm === this.lockParam.tgtEffDtTm) {

                  // if cpr data of target template record exits, should overwrite.
                  if (this.portionCPR && data.cprSectName && data.cprSectName.length)
                    bOverwrite = true

                  // if lad data of target template record exits, should overwrite.
                  if (this.portionLAD && data.lbl && data.lbl.length)
                    bOverwrite = true

                }

                if (bOverwrite) {
                  // asks the user if will overwrite.
                  // overwriteModalVisible: true
                  this.actionOverwrite();

                } else {  // if no overwrite
                  this.gotoTADPage(this.gConst.CADTOTADTYPE_EXIST)
                }
              }
            }
          }
          return
        }

        if (!this.portionEntire) {

          let utcTgtEffDtTm = body.tgtEffDtTm
          if (utcTgtEffDtTm === "NOW")
            utcTgtEffDtTm = gFunc.getUTCString(new Date())

          let nextUtcEffDtTm = ""
          let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)
          if (index + 1 < this.effDtTmStatList.length)
            nextUtcEffDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index + 1])

          // if target date time is future than current record date time, no need to retrieve
          let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
          if (utcEffDtTm < utcTgtEffDtTm) {

            // if next effective date time is selected, retrieve next.
            if (nextUtcEffDtTm === utcTgtEffDtTm) {
              await this.retrieveNumForTgtNum(nextUtcEffDtTm)
              return
            }

            if (!this.portionCPR) // if no select for the CPR, initialize the CPR
              this.initCPRData()

            if (!this.portionLAD) // if no select for the LAD, initialize the LAD
              // this.initLADGrids()
              this.ladGridData = Array(9).fill('').map(dd=>([]));
          } else { // if target date time is before than current record date time, should retrieve the before record.
            let effDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index - 1])
            await this.retrieveNumForTgtNum(effDtTm)
            return
          }
        }

        let effDtTmStat = "NOW"
        if (body.tgtEffDtTm != "NOW")
          effDtTmStat = gFunc.fromUTCStrToCTStr(body.tgtEffDtTm)
        let effDtTmStatList = [effDtTmStat]

        this.effDtTmStatList = effDtTmStatList;
        this.selectEffDtTmStat = effDtTmStat;
        this.num = body.tgtNum;
        this.inputEndIntDtTm = "";

        this.finishCpyTrnsfrOp()
        return
      }
    }
  }

  deleteCustomerRecord = () => {
    this.toggleDelete()

    let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat).replace(':', '').replace(/-/g, "")  // YYYY-MM-DDTHH:mmZ

    let params = { num: this.num, effDtTm: utcEffDtTm, recVersionId: this.recVersionId }
    this.api.deleteCadRec({ro: this.store.getCurrentRo(), body: JSON.stringify(params)}).subscribe(res => {
      if (res.success) {

      }
    })
  }

  convertCustomerRecord = async () => {
    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      tgtEffDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputTgtEffDtTm))
      // let d = new Date(this.inputTgtEffDtTm).getTime();
      // tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    // configs parameter for calling lock api
    let body = {
      recVersionId: this.recVersionId,
      numList: [this.inputSrcNum],
      srcEffDtTm: gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm),
      tgtEffDtTm: tgtEffDtTm,
      tmplName: this.inputTgtTmplName,
    }

    // calls lock api
    let res: any = await this.api.convertCadRec({'body': JSON.stringify(body), ro: this.inputRespOrg})
    if (res.success) {

    }
  }

  handleCheckOnModal = async (event: any, targetName: string) => {
    let state = {};
    let checked = event.checked;

    if (targetName === "portionEntire") {

      if (this.status !== this.gConst.STAT_FAILED && this.status !== this.gConst.STAT_INVALID && !this.transferModalVisible)
      this.portionCR = checked

      if (!this.noCPR)
        this.portionCPR = checked

      if (!this.noLAD)
      this.portionLAD = checked

      this.bCheckCREnable = !checked
      this.bCheckCPREnable = !checked
      this.bCheckLADEnable = !checked
    }

    if (targetName !== "portionEntire") {
      if (this.portionCR && this.portionCPR && this.portionLAD) {
        this.portionEntire = true;
        this.bCheckCREnable = false;
        this.bCheckCPREnable = false;
        this.bCheckLADEnable = false;
      }
    }
  };

  getCurEffDtTm = () => {
    let tempArr = this.selectEffDtTmStat.split(" ")
    return tempArr[0] + " " + tempArr[1] + " " + tempArr[2]
  }

  /**
 * unlock the customer record
 */
  unlockCustomerRecord = () => {
    let lockParam = this.lockParam

    // if tgtTmplName exists, that means this is the state that moves from CAD to TAD. Should not unlock.
    if (lockParam && lockParam.custRecAction && !Boolean(lockParam.tgtTmplName)) {
      let ro = this.store.getCurrentRo();
      let body: any = {}

      switch (lockParam.custRecAction) {
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

      this.api.unlockCadRec({'body': JSON.stringify(body), ro: ro}).subscribe(res => { })
    }
  }

  cancelAction = async () => {
    // console.log("cancelAction: "+ this.action)

    await this.unlockCustomerRecord()
    this.inputSearchNum = '';

    this.inputSearchEffDtTm = '';
    this.bRetrieveEnable = false;
    this.bExpRetrieve = true;
    this.bExpResult = false;
    this.bEffDtTmListHidden = true;
    this.selectEffDtTmStat = '';
    this.resultCardTitle = 'Result';
    this.retrieveCardTitle = 'Retrieve';
  };

  clearAllData = async () => {
    await this.initBasicData()
    await this.initCPRData()
    this.ladGridData = Array(9).fill('').map(dd=>([]));
  }

  initBasicData = () => {
    this.inputCreateEffDtTm = ''
    this.inputCreateNow = false 
    this.inputRespOrg = this.store.getCurrentRo()
    this.inputPriority = false 
    this.inputCustomerId = ''

    this.inputAgent = ''
    this.inputTelco = ''
    this.selectHold = ''

    this.inputEndSub = ''      // end subscriber name
    this.inputEndSubAddr = ''      // end subscriber address
    this.inputSvcOrderNum = ''      // service order num
    this.inputSuppFormNum = ''      // support form num

    this.inputLastUpDt = ''      // the date time of last changed
    this.inputApproval = ''      // approval
    this.inputLastUser = ''      // last user
    this.inputPrevUser = ''      // prev user

    this.destNums =                 [
      {
        destNum:              '',
        numTermLine:          '',
        localServOff:         '',
        forServOff:           '',
      }
    ];       // destination number

    this.inputContactName = '';
    this.inputContactNumber = '';
    this.inputNotes = '';

    this.inputEndIntDtTm = '';
    this.selectReferral = '';

    this.inputNetwork = '';
    this.inputState = '';
    this.inputNpa = '';
    this.inputLata = '';
    this.inputLabel = '';
    this.choiceModalList = [];
    this.choiceList = [];
    this.choiceModalHeaderTitle = '';
    this.choiceModalVisible = false;
    this.npaChoiceModalVisible = false;
    this.npaChoiceModalList = [];
    this.npaChecked = [];
    this.npaExpanded = [];

    this.selectInterLATACarrier = '';
    this.selectIntraLATACarrier = '';

    this.noCR = true;

    this.noNetworks = true;
    this.noStates = true;
    this.noNPAs = true;
    this.noLATAs = true;
    this.noLabels = true;
    this.noIAC = true;
    this.noIEC = true;
    this.inputMessage = '';
  }

  getDeleteModalTemplate = (event: any, num: string) => {
    return gFunc.formattedNumber(num);
  }

  getDeleteModalEffDtTm = (event: any, selectEffDtTmStat: string) => {
    return selectEffDtTmStat.split(' ')[0] + ' ' + selectEffDtTmStat.split(' ')[1] + ' ' + selectEffDtTmStat.split(' ')[2]
  }

  onSearchEffDtTmIntervalFifteenMin = () => {
    let d = new Date(this.inputSearchEffDtTm).getTime();
    this.inputSearchEffDtTm = new Date(Math.ceil(d / 900000) * 900000);
  }

  onEffDateTimeIntervalFifteenMin = () => {
    let d = new Date(this.inputCreateEffDtTm).getTime();
    this.inputCreateEffDtTm = new Date(Math.ceil(d / 900000) * 900000);
  }

  onEndIntDtTmIntervalFifteenMin = () => {
    let d = new Date(this.inputEndIntDtTm).getTime();
    this.inputEndIntDtTm = new Date(Math.ceil(d / 900000) * 900000);
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
