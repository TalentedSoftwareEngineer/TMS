import { Component, OnInit } from '@angular/core';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {closeEventSource, SseClient} from "angular-sse-client";
import * as gFunc from 'src/app/utils/utils';
import {
  TMPLNAME_REG_EXP,
  TAD_RETRIEVE_SUCCESSFUL,
  TAD_CREATE_SUCCESSFUL,
  TAD_UPDATE_SUCCESSFUL,
  TAD_COPY_SUCCESSFUL,
  TAD_TRANSFER_SUCCESSFUL,
  TAD_DISCONNECT_SUCCESSFUL,
  TAD_DELETE_SUCCESSFUL,
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
  CARRIER_LIST,
  DEFAULT_CARRIERS,
  INIT_CPR_GRID_LENGTH,
  INVALID_COL,
  INVALID_ROW,
  CPR_GRID_CATEGORY_OPTIONS,
  INIT_LAD_GRID_LENGTH,
  NUM_GRID_COL_LENGTH,
  INIT_NUM_GRID_LENGTH,
  PAGE_NO_PERMISSION_MSG,
  RETRIEVE_CARD_TITLE_PREFIX,
  RESULT_CARD_TITLE_PREFIX2,
  STAT_SAVED,
  STAT_FAILED,
  STAT_INVALID,
  STAT_SENDING,
  STAT_ACTIVE,
  STAT_OLD,
  STAT_DISCONNECT,
  STAT_MUSTCHECK,
  TAD_NO_PERMISSION_ERR_CODE,
  RO_CHANGE_MONITOR_INTERVAL,
  CADTOTADTYPE_NEW,
  CADTOTADTYPE_COOKIE_NAME,
  TRANSFER_PENDING_MSG,
  COPY_PENDING_MSG,
  DISCONNECT_PENDING_MSG,
  SUBMIT_CMD_SIGN,
  SAVE_CMD_SIGN,
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
  LBL_TYPE_GT
} from '../../constants';
import produce from "immer";
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import moment from 'moment';
import {environment} from "../../../../environments/environment";
import Cookies from "universal-cookie";

@Component({
  selector: 'app-template-admin-data',
  templateUrl: './template-admin-data.component.html',
  styleUrls: ['./template-admin-data.component.scss']
})
export class TemplateAdminDataComponent implements OnInit {

  gConst = {
    CADTOTADTYPE_NEW,
    CADTOTADTYPE_COOKIE_NAME,
    RO_CHANGE_MONITOR_INTERVAL,
    TAD_NO_PERMISSION_ERR_CODE,
    TMPLNAME_REG_EXP,
    TAD_CREATE_SUCCESSFUL,
    TAD_UPDATE_SUCCESSFUL,
    TAD_COPY_SUCCESSFUL,
    TAD_TRANSFER_SUCCESSFUL,
    TAD_DISCONNECT_SUCCESSFUL,
    TAD_DELETE_SUCCESSFUL,
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
    CARRIER_LIST,
    DEFAULT_CARRIERS,
    INIT_CPR_GRID_LENGTH,
    INVALID_COL,
    INVALID_ROW,
    RETRIEVE_CARD_TITLE_PREFIX,
    RESULT_CARD_TITLE_PREFIX2,
    STAT_SAVED,
    STAT_FAILED,
    STAT_INVALID,
    STAT_SENDING,
    STAT_ACTIVE,
    STAT_OLD,
    STAT_DISCONNECT,
    STAT_MUSTCHECK,
    TRANSFER_PENDING_MSG,
    COPY_PENDING_MSG,
    DISCONNECT_PENDING_MSG,
    SUBMIT_CMD_SIGN,
    SAVE_CMD_SIGN,
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
    LBL_TYPE_GT
  }

  retrieveCardTitle: string = 'Retrieve';
  bRetrieveCardIconHidden: boolean = false;
  bExpRetrieve: boolean = true;
  inputSearchTmplName: string = '';
  validTmplName: boolean = true;
  inputSearchEffDtTm: any = null;
  bRetrieveEnable: boolean = true;

  resultCardTitle: string = 'Result';
  bExpResult: boolean = false;
  effDtTmStatList: any[] = [];
  selectEffDtTmStat = '';
  bEffDtTmListHidden: boolean = true;
  disable: boolean = true;
  bContentModified: boolean = false;   // if user action has triggered for any one input field, this state is true
  tmplNameParam: string = '';      // the state to use as template name parameter for calling retrieve template record
  effDtTmParam: string = '';      // the state to use as effective date time parameter for calling retrieve template record
  preEffDtTmStat: string = '';      // the state to save previous eff date time state at changing selection on the eff date time state select field
  inputMessage: string = ''

  bEffDtTmDisable: boolean = false;
  action: string = this.gConst.ACTION_NONE;
  copyAction: string = this.gConst.COPYACTION_CHANGE;
  tmplName: string = '';

  activeMainTab: number = 0;
  activeAOSTab: number = 0;
  activeCarrierTab: number = 0;
  activeCPRTab: number = 0;
  activeLADTab: number = 0;

  inputRespOrg: string = '';
  inputCreateEffDtTm: any = null;
  minEffDateTime: Date = new Date();
  inputCreateNow: boolean = false;
  inputPriority: boolean = false;
  inputDscInd: boolean = false;    // disconnect instruction

  inputTemplateId: string = '';       // template id
  inputDescription: string = '';       // template description
  inputLine: string = ''; // numTermLine
  inputApproval: string = '';
  inputLastUpDt: string = '';
  inputLastUser: string = '';
  inputPrevUser: string = '';
  inputContactName: string = '';
  inputContactNumber: string = '';
  inputNotes: string = '';
  inputNetwork: string = '';
  inputState: string = '';
  inputNpa: string = '';
  inputLata: string = '';
  inputLabel: string = '';
  inputIntraLATACarrier: string = '';
  inputInterLATACarrier: string = '';

  inputSearchLadVal: string = '';

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

  noNetworks: boolean = true;    // there is no newtorks
  noStates: boolean = true    // there is no states
  noNPAs: boolean = true    // there is no NPAs
  noLATAs: boolean = true    // there is no LATAs
  noLabels: boolean = true    // there is no labels
  noIAC: boolean = true    // there is no intraLATACarrier
  noIEC: boolean = true    // there is no interLATACarrier

  choiceModalList: any[] = [];       // list that is displayed on the choice list modal
  choiceList: any[] = [];       // list of the choice index on the choice list modal
  choiceModalHeaderTitle: string = '';       // the title of list header on the choice list modal
  choiceModalVisible: boolean = false;    //  choice modal visible
  npaChoiceModalVisible: boolean = false;    // NPA modal visible
  npaChoiceModalList: any[] = [];       // tree list of the NPA choice index on the NPA choice list modal
  npaChecked: any[] = [];       // checked list on the NPA choice list modal
  npaExpanded: any[] = [];       // expanded list on the NPA choice list modal

  recVersionId: any = '';       // record version id
  tmplRecCompPart: any = '';       // template record component part
  srcRecVersionId: string = '';       // source record version id

  iac_array: any[] = this.gConst.DEFAULT_CARRIERS // intraLATACarrier list
  iec_array:  any[] = this.gConst.DEFAULT_CARRIERS // interLATACarrier list

  //CPR Tab
  cprSectNames: any[] = [];
  cprGridCategory: any[] = Array(1).fill(Array(8).fill('')); // category list of each tab
  cprGridData: any[] =  Array(1).fill(Array(INIT_CPR_GRID_LENGTH).fill(Array(8).fill(''))) // grid data of each tab
  cprCurActiveRow: any[] = Array(1).fill(this.gConst.INVALID_ROW) // current active row index of each tab
  cprCurActiveCol: any[] =  Array(1).fill(this.gConst.INVALID_COL) // current active col index of each tab
  cprGridCategoryOptions: any[] = CPR_GRID_CATEGORY_OPTIONS;

  cprSectNameErr: boolean =  false;            // flag for the error
  cprSectNameModalVisible: boolean = false;   // section setting modal visible
  cprDeleteModalVisible: boolean = false;
  cprSectNameModalTitle: string = '';
  cprSectNameModalBtnName: string = '';      // modal buttonName
  cprSectSettingName: string =  '';           // section name on the section setting modal

  // TAD Tab
  searchResult: any = {total: -1, curIndex: -1}; // lad search result
  nextSearch: boolean = true;     // next search
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

  //Number List
  numberList: any[] = [];     // number list that belong to template
  inputSrchNum: string = '';
  numGrid: any[] = Array(INIT_NUM_GRID_LENGTH).fill(Array(NUM_GRID_COL_LENGTH).fill(''));

  bEditEnable: boolean = false;    // Edit button enable status
  bCopyEnable: boolean = false;    // Copy button enable status
  bTransferEnable: boolean = false    // Transfer button enable status
  bDeleteEnable: boolean = false    // Delete button enable status
  bSubmitEnable: boolean = false    // Submit button enable status
  bSaveEnable: boolean = false    // Save button enable status
  bRevertEnable: boolean = false    // Revert button enable status
  bCancelEnable: boolean = false    // Cancel button enable status

  // Modal Window visible
  modifiedModalVisible: boolean = false;
  copyModalVisible: boolean = false;
  deleteModalVisible: boolean = false;
  cprDelSectModalVisible: boolean = false;    // section delete modal visible
  transferModalVisible: boolean = false;
  createModalVisible: boolean = false;

  inputSrcTmplName: string = '';
  inputSrcEffDtTm: string = '';
  nowDateTime: any = new Date();
  inputTgtEffDtTm: any = new Date();
  inputCopyNow: boolean = false;
  inputTgtTmplName: string = '';
  radioCopyAction: string = this.gConst.COPYACTION_CHANGE;
  portionEntire: boolean = false;
  portionCR: boolean = false;
  portionCPR: boolean = false;
  portionLAD: boolean = false;
  validMsg: string = '';

  status: string = ''; // template record status
  bCheckCREnable: boolean = false;
  bCheckCPREnable: boolean = false;
  bCheckLADEnable: boolean = false;
  noCR: boolean = true;    // there is no CR data
  noCPR: boolean = true;    // there is no CPR data
  noLAD: boolean = true;    // there is no LAD data
  noNumList: boolean = true    // there is no number list data

  lockParam: any = {}     // parameter that was used for calling lock api
  tgtRetrieveData: any = {} // retrieve data of target template record

  gridArea: any[] = [];     // area
  gridDate: any[] = [];     // date
  gridLATA: any[] = [];     // LATA
  gridNXX: any[] = [];     // NXX
  gridState: any[] = [];     // state
  gridTel: any[] = [];     // tel
  gridTime: any[] = [];     // time
  gridTD: any[] = [];     // 10-digit
  gridSD: any[] = [];     // 6-digit

  noGridArea: boolean = true;    // there is no grid area
  noGridDate: boolean = true;    // there is no grid date
  noGridLATA: boolean = true;    // there is no grid LATA
  noGridNXX: boolean = true;    // there is no grid NXX
  noGridState: boolean = true;    // there is no grid state
  noGridTel: boolean = true;    // there is no grid tel
  noGridTime: boolean = true;    // there is no grid time
  noGridTD: boolean = true;    // there is no grid ten digit
  noGridSD: boolean = true;    // there is no grid six digit

  srchNum: string = '';

  bRevertClicked: boolean = false;

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
      if(state.user.permissions?.includes(PERMISSIONS.TEMPLATE_ADMIN_DATA)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id, { keepAlive: true }).subscribe(data => {
      console.log(data);
      this.inputMessage = data.title + data.message + '<br><br>' + this.inputMessage;
    })

    this.initialDataLoading();
  }

  initialDataLoading = async () => {
    this.initCPRData()
    // this.initLADGrids()
    this.ladGridData = Array(9).fill('').map(dd=>([]));
    // setInterval(() => { this.monitorRoChange()}, this.gConst.RO_CHANGE_MONITOR_INTERVAL)
    const cookies = new Cookies();

    // if the copy or transfer from cad page
    let cadToTadType = cookies.get(this.gConst.CADTOTADTYPE_COOKIE_NAME)
    if (cadToTadType) {
      let cadState = JSON.parse(this.store.getCadState())

      if (cadToTadType === this.gConst.CADTOTADTYPE_NEW) {
        this.migrateCadAndTmpl(cadState)
      } else {
        this.lockParam = cadState.lockParam;
        this.portionCR = cadState.portionCR;
        this.portionLAD = cadState.portionLAD;
        this.portionCPR = cadState.portionCPR;
        this.tgtRetrieveData = cadState.tgtRetrieveData;

        // section names
        this.cprSectNames = cadState.cprSectNames;
        this.cprGridCategory = cadState.cprGridCategory;
        this.cprGridData = cadState.cprGridData;
        this.cprCurActiveRow = Array(cadState.cprSectNames.length).fill(this.gConst.INVALID_ROW);
        this.cprCurActiveCol = Array(cadState.cprSectNames.length).fill(this.gConst.INVALID_COL);

        // lad data
        this.ladGridCategory = cadState.ladGridCategory;
        this.ladGridData = cadState.ladGridData;
        this.ladSectNames = cadState.ladSectNames;

        this.action = cadState.lockParam.custRecAction;
        this.disable = false;
        this.migrateSurAndTgtTemplate()
      }

      cookies.remove("cadToTadType")
      return
    }

    let tmplName = cookies.get("tmplName");
    let effDtTm = cookies.get("effDtTm");

    cookies.remove("tmplName");
    cookies.remove("effDtTm");
    if (tmplName) {
      if (Boolean(effDtTm)) {
        let localDtTm = new Date(effDtTm)
        this.inputSearchTmplName = tmplName;
        this.inputSearchEffDtTm = localDtTm;
      } else {
        this.inputSearchTmplName = tmplName
      }

      let UTCString = gFunc.fromCTStrToUTCStr(effDtTm)

      if (await this.retrieveTemplateRecord(tmplName, UTCString, true)) {
        this.inputMessage = TAD_RETRIEVE_SUCCESSFUL;
      }
      return
    }
  }

  monitorRoChange = async () => {
    let searchTmplName = this.inputSearchTmplName
    if (this.bExpResult)  searchTmplName = ''

    await this.cancelAction()
    this.inputSearchTmplName = searchTmplName;
  }

  migrateCadAndTmpl = async (cadState: any) => {
    let lockParam = cadState.lockParam;

    this.retrieveCardTitle = this.gConst.RETRIEVE_CARD_TITLE_PREFIX + ": " + lockParam.tgtTmplName;
    this.resultCardTitle = cadState.resultCardTitle;
    this.bExpRetrieve = false;
    this.bExpResult = true;
    this.bRetrieveCardIconHidden =  true;
    this.bEffDtTmListHidden = false;
    this.bEffDtTmDisable = true;
    this.disable =                  false;
    this.selectEffDtTmStat =              gFunc.fromUTCStrToCTStr(lockParam.tgtEffDtTm);
    this.effDtTmStatList =          [gFunc.fromUTCStrToCTStr(lockParam.tgtEffDtTm)];
    this.status =                   cadState.status;
    this.tmplName =                 lockParam.tgtTmplName;
    // button disable/enable flags
    this.bRetrieveEnable =          true,     // Retrieve button enable statu;
    this.bEditEnable =              false,    // Edit button enable statu;
    this.bCopyEnable =              false,    // Copy button enable statu;
    this.bTransferEnable =          false,    // Transfer button enable statu;
    this.bDeleteEnable =            false,    // Delete button enable statu;
    this.bSubmitEnable =            true,    // Submit button enable statu;
    this.bSaveEnable =              true,    // Save button enable statu;
    this.bRevertEnable =            false,    // Revert button enable statu;
    this.bCancelEnable =            false,    // Cancel button enable statu;

    this.copyAction =               cadState.copyAction;
    this.portionEntire =            cadState.portionEntire;
    this.portionCR =                cadState.portionCR;
    this.portionCPR =               cadState.portionCPR;
    this.portionLAD =               cadState.portionLAD;

    this.lockParam =                cadState.lockParam;

    /*********************************** Basic Data *************************************/
    this.inputRespOrg =                  cadState.respOrg;
    this.inputPriority =                 cadState.priority;

    this.inputContactName =              cadState.contactName;
    this.inputContactNumber =            cadState.contactNumber;
    this.inputNotes =                    cadState.notes;

    this.inputNetwork =                  cadState.network;
    this.inputState =                    cadState.state;
    this.inputNpa =                      cadState.npa;
    this.inputLata =                     cadState.lata;
    this.inputLabel =                    cadState.label;

    this.inputInterLATACarrier =         cadState.interLATACarrier;
    this.inputIntraLATACarrier =         cadState.intraLATACarrier;

    this.recVersionId =             cadState.recVersionId;
    this.tmplRecCompPart =          '',       // template record component par;

    this.iac_array =                cadState.iac_array;
    this.iec_array =                cadState.iec_array;
    this.selectPriIntraLT =               cadState.priIntraLT;
    this.selectPriInterLT =               cadState.priInterLT;
    this.selectTimezone =                 cadState.timezone;
    this.inputDayLightSaving =           cadState.dayLightSaving;
    this.inputNpaCntPerCarrier =         cadState.npaCntPerCarrier;
    // section names
    this.cprSectNames = cadState.cprSectNames;
    this.cprGridCategory = cadState.cprGridCategory;
    this.cprGridData = cadState.cprGridData;
    this.cprCurActiveRow = Array(cadState.cprSectNames.length).fill(this.gConst.INVALID_ROW);
    this.cprCurActiveCol = Array(cadState.cprSectNames.length).fill(this.gConst.INVALID_COL);
    /*********************************** LAD Data ***********************************/
    this.ladGridCategory = cadState.ladGridCategory;
    this.ladGridData = cadState.ladGridData;
    this.ladSectNames = cadState.ladSectNames;

    let pendingMsg = this.gConst.COPY_PENDING_MSG
    if (lockParam.custRecAction === this.gConst.ACTION_DISCONNECT)
      pendingMsg = this.gConst.DISCONNECT_PENDING_MSG

    this.showSuccess(pendingMsg);
    this.action = lockParam.custRecAction
    this.inputMessage = pendingMsg;

    if (cadState.destNums)
      this.inputLine = cadState.destNums[0].numTermLine

    this.checkDataExistForCR()
    this.checkDataExistForCPR()
    this.checkDataExistForLAD()
  }

  async ngOnDestroy() {
    this.unlockTemplateRecord();
  }

  getBoolean = (value: any) => Boolean(value);

  /**
  * this is called when the focus of search template name field is lost
  */
  onSearchTmplNameFieldFocusOut = async () => {
    // if (!gConst.TMPLNAME_REG_EXP.test(this.state.searchTmplName)) {
    //   await this.setState({validTmplName: false})
    // } else {
    //   this.setState({validTmplName: true})
    // }
  }

  reflectDataOnPage = (tmplName: string, data: any) => {
    return new Promise<void>(resolve=>{
      // console.log(data);
      this.noLAD = true;
      this.noCPR = true;

      let effDtTm = data.effDtTm
      // gets the list of effective date time
      let lstEffDtTms = data.lstEffDtTms

      // effective date time status list
      let nEffIndex = 0
      let dtTmStatList = []

      for (let i = 0; i < lstEffDtTms.length; i++) {

        let edt = lstEffDtTms[i]
        let dtTmString = gFunc.fromUTCStrToCTStr(edt.effDtTm)
        let dtTmStat = dtTmString + " CT " + edt.tmplRecStat.replace("_", " ")
        dtTmStatList.push(dtTmStat)

        if (effDtTm == edt.effDtTm) {
          nEffIndex = i;
        }
      }
  
      let status = lstEffDtTms[nEffIndex].tmplRecStat.replace("_", " ")
      this.tmplName = tmplName;
      this.retrieveCardTitle = this.gConst.RETRIEVE_CARD_TITLE_PREFIX + ": " + this.inputSearchTmplName;
      this.bRetrieveCardIconHidden = true;
      this.resultCardTitle = this.gConst.RESULT_CARD_TITLE_PREFIX2;
      this.effDtTmStatList = dtTmStatList;
      // this.bResultHeaderHidden = false;
      this.bEffDtTmListHidden = false;
      this.bExpRetrieve = false;
      this.bExpResult = true;
      this.selectEffDtTmStat = dtTmStatList[nEffIndex]
      this.status = status;
      this.tmplRecCompPart = lstEffDtTms[nEffIndex].tmplRecCompPart.replace(/\_/g, ", ");
  
      this.inputRespOrg = Boolean(data.ctrlRespOrgId) ? data.ctrlRespOrgId : '';
      this.inputPriority = data.priority == 'Y';
      this.inputDscInd = Boolean(data.dscInd) ? data.dscInd : false;
      this.inputLastUpDt = Boolean(data.lastUpDt) ? moment(new Date(data.lastUpDt)).format('YYYY/MM/DD h:mm:ss A') : '';
      this.inputApproval = Boolean(data.approval) ? data.approval : '';
      this.inputLastUser = Boolean(data.lastUsr) ? data.lastUsr : '';
      this.inputPrevUser = Boolean(data.prevUsr) ? data.prevUsr : '';
      this.inputTemplateId = Boolean(data.tmplId) ? data.tmplId : '';
      this.inputDescription = Boolean(data.tmplDesc) ? data.tmplDesc : '';
      this.inputContactName = Boolean(data.conName) ? data.conName : '';
      this.inputContactNumber = Boolean(data.conTel) ? data.conTel : '';
      this.inputNotes = Boolean(data.notes) ? data.notes : '';
      this.inputLine = Boolean(data.numTermLine) ? data.numTermLine : '';
      this.inputNetwork = Boolean(data.aos.aosNet) ? data.aos.aosNet.toString() : '';
      this.inputState = Boolean(data.aos.aosStat) ? data.aos.aosNet.toString() : '';
      this.inputNpa = Boolean(data.aos.aosNpa) ? data.aos.aosNet.toString() : '';
      this.inputLata = Boolean(data.aos.aosLata) ? data.aos.aosNet.toString() : '';
      this.inputLabel = Boolean(data.aos.aosLabel) ? data.aos.aosNet.toString() : '';
      this.inputInterLATACarrier = Boolean(data.interLATACarrier) ? data.interLATACarrier.toString() : '';
      this.inputIntraLATACarrier = Boolean(data.intraLATACarrier) ? data.intraLATACarrier.toString() : '';
      if(data.cprSectName) {
        this.cprSectNames = data.cprSectName.map((item: any)=>item.name);
        this.cprGridCategory = data.cprSectName.map((item: any)=>item.nodeSeq);
        this.cprGridData = data.cprSectName.map((item: any)=> {
          let tmp = Array(Math.ceil(item.nodes.length/item.nodeSeq.length)).fill('').map((dd: any)=>(Array(item.nodeSeq.length).fill('')));
          item.nodes.forEach((node: any)=>{
            tmp[node.rowIndex-1][node.colIndex-1] = node.values.toString();
          });
          return tmp;
        });  
        this.noCPR = false;
      }
      this.selectPriIntraLT = Boolean(data.priIntraLT) ? data.priIntraLT : '';
      this.selectPriInterLT = Boolean(data.priInterLT) ? data.priInterLT : '';
      this.selectTimezone = Boolean(data.tmZn) ? data.tmZn : '';
      this.inputDayLightSaving = Boolean(data.dayLightSavings) ? data.dayLightSavings == "Y" : false;
      this.inputNpaCntPerCarrier = Boolean(data.npaCntPerCarrier) ? data.npaCntPerCarrier : '';
  
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
  
      if(data.numbers) {
        this.arrangeNumberList(data.numbers).then((arrangedNums: any[])=>{
          this.numGrid = arrangedNums;
        });
      }

      this.recVersionId = Boolean(data.recVersionId) ? data.recVersionId : '';
  
      this.bEffDtTmDisable = false;
  
      this.bExpRetrieve = false;
  
      // if current date is before than the the date of selected template record
      let ctEffDtTmStr = this.getCurEffDtTm()
      let localEffDtTm = gFunc.fromCTStrToLocalTime(ctEffDtTmStr)
      let curTime = new Date()
  
      if (localEffDtTm >= curTime) {
        this.bDeleteEnable = true;
        this.bEditEnable = true;
      } else {
        this.bEditEnable = false;
        this.bDeleteEnable = false;
      }
  
      let bTransferEnable: boolean = true;
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
      this.bRetrieveEnable = false;
      this.bCopyEnable = bCopyEnable;
      this.bTransferEnable = bTransferEnable;
      this.bSubmitEnable = bSubmitEnable;
      this.bSaveEnable = false;
      this.bRevertEnable = false;
      this.bCancelEnable = true;
  
      this.bEffDtTmDisable = false;
      resolve();
    });
  }

  /**
   * this function is called at clicking the retrieve button of the retrieve card.
   */
  async onSearchTemplate() {

    if (!this.gConst.TMPLNAME_REG_EXP.test(this.inputSearchTmplName)) {
      this.validTmplName = false;
      return
    }

    this.inputMessage = ''
    let searchUTCString = ""
    if (Boolean(this.inputSearchEffDtTm)) {
      let searchCTDtTm = new Date(this.inputSearchEffDtTm)
      searchUTCString = gFunc.fromCTTimeToUTCStr(searchCTDtTm)
    }

    // if any modified, shows the modal asking if really will do
    if (this.bContentModified) {
      this.tmplNameParam = this.inputSearchTmplName;
      this.effDtTmParam = searchUTCString;
      this.preEffDtTmStat = '';   // sets as empty here
      this.modifiedModalVisible = true;
    } else if (await this.retrieveTemplateRecord(this.inputSearchTmplName, searchUTCString, true)) {
      // NotificationManager.success("", TAD_RETRIEVE_SUCCESSFUL)
      this.inputMessage = TAD_RETRIEVE_SUCCESSFUL;
    }
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

  arrangeNumberList = (numbers: any[]) => {
    if(numbers.length % 10 != 0 ) {
      numbers = numbers.concat(Array(10-(numbers.length % 10)).fill(''));
    }
    return new Promise<any[]>((resolve, reject) => {
      let tmp: any[] = [];
      while(numbers.length) {
        tmp = [...tmp, ['', ...numbers.splice(0,10)]];
      }
      resolve(tmp);
    });
  }

  /**
   * retrieve template record.
   * @param tmplName
   * @param effDtTm: UTC time string of YYYY-MM-DDTHH:mmZ type
   * @returns {Promise<void>}
   */
  retrieveTemplateRecord = async (tmplName: string, effDtTm:string, isUserAct: boolean = false): Promise<boolean> => {
    // this.bRetrieveEnable = false;

    if (effDtTm != "NOW")
      effDtTm = effDtTm.replace(/\-/g, "").replace(":", "");

    let ro = this.store.getCurrentRo();
    let res = await new Promise<any>((resolve, reject)=> {
      this.api.tmplAdminDataRetrieve(ro, tmplName, effDtTm).subscribe( async (res)=>{
        // console.log(res);
        resolve(res);
      }, err=>{
        reject(false);
        return false;
      });
    },);

    this.bRetrieveEnable = true;
    if(res) {
      this.unlockTemplateRecord()
      let errList = res.errList
      let errCode = ""

      // if no result, shows the message if moves to create mode
      if (errList && errList[0].errLvl === "ERROR") {
        errCode = errList[0].errCode
        if (errCode === "540002") {
          let errMsg = gFunc.synthesisErrMsg(errList)
          this.showError(errMsg, 'Error');
        } else {
          if (errCode === "540001") {
            // this.setState({createModalVisible: true, })
            this.confirmationService.confirm({
              message: 'Do you want to create a new Template Record?',
              header: 'No Results',
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
            this.bRetrieveEnable = true
          } else {
            let errMsg = gFunc.synthesisErrMsg(errList)
            this.showError(errMsg, '')
            this.bRetrieveEnable = true
          }
          return false
        }
      }

      if(res.isNew) {
        this.createModalVisible = true;
      }
      await this.reflectDataOnPage(tmplName, res)
      // this.backupStateToLastAction()
      return true;
    } else {
      return false;
    }
  };

  createAction = async () => {
    let retrieveCardTitle = "Create a New Template: " + this.inputSearchTmplName
    this.action = this.gConst.ACTION_CREATE;
    this.disable = false;
    this.tmplName = this.inputSearchTmplName;
    this.retrieveCardTitle = retrieveCardTitle;
    this.bRetrieveCardIconHidden = true;
    this.bExpRetrieve = false;
    this.bExpResult = true;

    this.bEditEnable = false;
    this.bCopyEnable = false;
    this.bTransferEnable = false;
    this.bDeleteEnable = false;

    this.clearAllData();
    // get user information from the server and set the mail.
    this.inputContactName = this.store.getContactInformation()?.name;
    this.inputContactNumber = gFunc.formattedNumber(this.store.getContactInformation()?.number);
    this.noCR = false;
  };

  clearAllData = () => {
    this.initBasicData()
    this.initCPRData()
    this.ladGridData = Array(9).fill('').map(dd=>([]));
  }

  initBasicData = () => {
    this.inputCreateEffDtTm = '',       // effective date time value for creating
    this.inputCreateNow = false,    // now check value

    this.inputRespOrg = String(this.store.getCurrentRo()),       // resp organization
    this.inputPriority = false,    // high priority
    this.inputDscInd = false,    // disconnect instruction

    this.inputTemplateId = '',       // template id
    this.inputDescription = '',       // template description
    this.inputLine = '',       // numTermLine

    this.inputContactName = '',       // contact name
    this.inputContactNumber = '',       // contact telephone
    this.inputNotes = '',       // notes

    this.inputNetwork = '',       // Area of Service: network
    this.inputState = '',       // Area of Service: state
    this.inputNpa = ''       // Area of Service: npa
    this.inputLata = ''       // Area of Service: lata
    this.inputLabel = ''       // Area of Service: label
    this.choiceModalList = [],      // list that is displayed on the choice list modal
    this.choiceList = [],      // list of the choice index on the choice list modal
    this.choiceModalHeaderTitle = '',      // the title of list header on the choice list modal
    this.choiceModalVisible = false    //  choice modal visible
    this.npaChoiceModalVisible = false    // NPA modal visible
    this.npaChoiceModalList = [],      // tree list of the NPA choice index on the NPA choice list modal
    this.npaChecked = [],      // checked list on the NPA choice list modal
    this.npaExpanded = [],      // expanded list on the NPA choice list modal

    this.inputInterLATACarrier = '',      // interLATACarrier
    this.inputIntraLATACarrier = '',      // intraLATACarrier

    this.noCR = true

    this.noNetworks = true
    this.noStates = true
    this.noNPAs = true
    this.noLATAs = true
    this.noLabels = true
    this.noIAC = true
    this.noIEC = true
    this.inputMessage = ''
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
      this.tmplNameParam = this.tmplName;
      this.effDtTmParam = UTCTimeStr;
      this.preEffDtTmStat = this.selectEffDtTmStat;
      this.modifiedModalVisible = true
    } else if (await this.retrieveTemplateRecord(this.tmplName, UTCTimeStr, true)) {
      this.inputMessage = TAD_RETRIEVE_SUCCESSFUL
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

  onImportFileSelected = (event: any) => {

  }

  onClearBasicData = () => {

  }

  /**
   *
   * @param event
   */
  handleOnCR = () => {
    this.bContentModified = true;
    this.checkDataExistForCR()
  };

  checkDataExistForCR = () => {

    // check if the CR data exists
    let bExistCR = false
    let bExistNetworks = false, bExistStates = false, bExistNPAs = false, bExistLATAs = false, bExistLabels = false
    let bExistIAC = false, bExistIEC = false

    if (this.action === this.gConst.ACTION_CREATE) {
      if (Boolean(this.inputCreateEffDtTm))
        bExistCR = true

      if (this.inputCreateNow)                bExistCR = true
      if (this.inputRespOrg !== '')           bExistCR = true
    }

    if (this.inputPriority)                   bExistCR = true
    if (this.inputDscInd)                     bExistCR = true
    if (this.inputDescription !== '')         bExistCR = true
    if (this.inputLine !== '')                bExistCR = true
    if (this.inputContactName !== '')         bExistCR = true
    if (this.inputContactNumber !== '')       bExistCR = true
    if (this.inputNotes !== '')               bExistCR = true

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
    if (this.inputIntraLATACarrier !== '') {
      bExistCR = true
      bExistIAC = true
    }
    if (this.inputInterLATACarrier !== '') {
      bExistCR = true
      bExistIEC = true
    }

    this.noCR = !bExistCR;
    this.noNetworks = !bExistNetworks;
    this.noStates = !bExistStates;
    this.noNPAs = !bExistNPAs;
    this.noLATAs = !bExistLATAs;
    this.noLabels = !bExistLabels;
    this.noIAC = !bExistIAC;
    this.noIEC = !bExistIEC;
  }

  onChangeCheckboxDscInd = () => {
    let dscInd = this.inputDscInd;
    this.inputDscInd = (dscInd || this.action === this.gConst.ACTION_DISCONNECT) && this.copyAction !== this.gConst.COPYACTION_NEW;
    this.handleOnCR();
  }

  handleUppercase = (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (input.name != "searchTmplName") {
      this.bContentModified = true;
    }
    this.checkDataExistForCR()
  }

  onSelectAosNetwork = () => {
    let choiceList: any[] = []
    if (this.inputNetwork !== '')
      choiceList = this.inputNetwork.replace(/\ /g, "").split(",")

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
      choiceList = this.inputState.replace(/\ /g, "").split(",")

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
      choiceList = this.inputLata.replace(/\ /g, "").split(",")

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

  /**
   * this function is called when the inter lata carrier or intra lata carrier is changed.
   * @param event
   */
  handleCarrier = async (type: string) => {
    let carriers = [];
    let temp: any;
    if(type=='Intra') {
      temp = this.inputIntraLATACarrier.replace(/\ /g, "").split(",")
    } else if(type=='Inter') {
      temp = this.inputInterLATACarrier.replace(/\ /g, "").split(",")
    }
    for (let carrier of temp) {
      if (this.gConst.CARRIER_LIST.indexOf(carrier) !== -1)
        carriers.push(carrier)
    }
    if (type === 'Inter')
      this.iec_array = this.getMergedCarriers(carriers)
    else if (type === 'Intra')
      this.iac_array = this.getMergedCarriers(carriers)

    this.bContentModified = true;
    this.checkDataExistForCR()
  };

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

  onSelectIntraLATACarrier = () => {
    let choiceList: any[] = []
    if (this.inputIntraLATACarrier !== '')
      choiceList = this.inputIntraLATACarrier.replace(/\ /g, "").split(",")

      this.choiceModalVisible = true
      this.choiceModalHeaderTitle = this.gConst.IAC_MODAL_HEADER_TITLE
      this.choiceModalList = this.gConst.CARRIER_LIST
      this.choiceList = choiceList
  }

  onClearIntraLATACarrier = async () => {
    this.inputIntraLATACarrier = '';
    this.iac_array = this.gConst.DEFAULT_CARRIERS
    this.selectPriIntraLT = ''
    this.bContentModified = true;
    this.checkDataExistForCR()
  }

  onSelectInterLATACarrier = () => {
    let choiceList: any[] = []
    if (this.inputInterLATACarrier !== '')
      choiceList = this.inputInterLATACarrier.replace(/\ /g, "").split(",")

      this.choiceModalVisible = true;
      this.choiceModalHeaderTitle = this.gConst.IEC_MODAL_HEADER_TITLE,
      this.choiceModalList = this.gConst.CARRIER_LIST;
      this.choiceList = choiceList;

  }

  onClearInterLATACarrier = async () => {
    this.inputInterLATACarrier = '';
    this.iec_array = this.gConst.DEFAULT_CARRIERS;
    this.selectPriInterLT = '';
    this.bContentModified = true;
    this.checkDataExistForCR()
  }

  getPriIntraLTOptions = () => {
    let options = this.iac_array.map(item=>({name: item, value: item}));
    return [{name: 'Select', value: ''}, ...options];
  }

  getPriInterLTOptions = () => {
    let options = this.iec_array.map(item=>({name: item, value: item}));
    return [{name: 'Select', value: ''}, ...options];
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

  checkDataExistForLAD = () => {

    // check if the LAD data exists
    let bExistArea = false, bExistDate = false, bExistLATA = false, bExistNXX = false
    let bExistState = false, bExistTel = false, bExistTime = false, bExistTD = false, bExistSD = false

    for (let row of this.gridArea) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistArea = true; break; }
      }
      if (bExistArea) break
    }

    for (let row of this.gridDate) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistDate = true; break; }
      }
      if (bExistDate) break
    }

    for (let row of this.gridLATA) {
      for (let cell of Object.values(row)) {
        if (cell !=="") { bExistLATA = true; break; }
      }
      if (bExistLATA) break
    }

    for (let row of this.gridNXX) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistNXX = true; break; }
      }
      if (bExistNXX) break
    }

    for (let row of this.gridState) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistState = true; break; }
      }
      if (bExistState) break
    }

    for (let row of this.gridTel) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistTel = true; break; }
      }
      if (bExistTel) break
    }

    for (let row of this.gridTime) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistTime = true; break; }
      }
      if (bExistTime) break
    }

    for (let row of this.gridTD) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistTD = true; break; }
      }
      if (bExistTD) break
    }

    for (let row of this.gridSD) {
      for (let cell of Object.values(row)) {
        if (cell !== "") { bExistSD = true; break; }
      }
      if (bExistSD) break
    }

    let bExistLAD = bExistArea || bExistDate || bExistLATA || bExistNXX || bExistState || bExistTel || bExistTime || bExistTD || bExistSD

    // console.log("bExistArea: " + bExistArea)

    this.noLAD = !bExistLAD;
    this.noGridArea = !bExistArea;
    this.noGridDate = !bExistDate;
    this.noGridLATA = !bExistLATA;
    this.noGridNXX = !bExistNXX;
    this.noGridState = !bExistState;
    this.noGridTel = !bExistTel;
    this.noGridTime = !bExistTime;
    this.noGridTD = !bExistTD;
    this.noGridSD = !bExistSD;
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

  handleOnCPR = () => {
    this.bContentModified = true;
    this.checkDataExistForCPR()
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

  handleSrchNumChange = () => {
    let srchNum = this.inputSrchNum;
    let srchedNumList = []

    if (srchNum === '') {
      srchedNumList = this.numberList
    } else {
      for (let num of this.numberList) {
        if (num.includes(srchNum))
          srchedNumList.push(num)
      }
    }

    let numGridRowLen = srchedNumList.length / NUM_GRID_COL_LENGTH
    if (srchedNumList.length % NUM_GRID_COL_LENGTH > 0)
      numGridRowLen++

    numGridRowLen = Math.max(INIT_NUM_GRID_LENGTH, numGridRowLen)

    let numGrid = new Array(numGridRowLen).fill(0).map(() => new Array(NUM_GRID_COL_LENGTH).fill(''))
    for (let i = 0; i < numGridRowLen; i++) {
      for (let j = 0; j < NUM_GRID_COL_LENGTH; j++) {
        if ((i * NUM_GRID_COL_LENGTH + j) >= srchedNumList.length)
          break

        numGrid[i][j] = srchedNumList[i * NUM_GRID_COL_LENGTH + j]
      }
    }

    this.numGrid = numGrid;
  }

  onEdit = async () => {
    let UTCTimeStr = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    let ro = this.store.getCurrentRo();
    let body = {
      custRecAction: this.gConst.ACTION_UPDATE, 
      srcTmplName: this.tmplName, 
      srcEffDtTm: UTCTimeStr, 
      tmplRecCompPart: this.tmplRecCompPart
    }

    await new Promise<void>(resolve=>{
      this.api.tmplLock({ro: ro, body: JSON.stringify(body)}).subscribe(res=> {
        if (res) {
          if (res.updateStatus.isAllowed === 'Y') {
            this.lockParam = body;
            this.action = this.gConst.ACTION_UPDATE

            this.disable = false
            this.bEditEnable = false
            this.bSubmitEnable = true
            this.bSaveEnable = true
            return
          }
        }
  
        if (res && res.updateStatus && res.updateStatus.statusMessages !== null) {
          this.inputMessage = gFunc.synthesisErrMsg(res.updateStatus.statusMessages);
        }
        resolve();
      });
    });
  }

  onCopy = () => {
    this.inputSrcTmplName = this.tmplName;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtTmplName = this.tmplName;
    this.inputTgtEffDtTm = '';
    this.inputCopyNow = false;
    this.validMsg = '';
    this.bCheckCREnable = true;
    this.bCheckCPREnable = true;
    this.bCheckLADEnable = true;
    this.portionEntire = false;
    this.portionCR = false;
    this.portionCPR = false;
    this.portionLAD = false;
    this.copyAction = this.gConst.COPYACTION_CHANGE;
    this.copyModalVisible = true;
  }

  /**
   * get current effective date time
   * @returns {string}
   */
  getCurEffDtTm = () => {
    let tempArr = this.selectEffDtTmStat.split(" ")
    return tempArr[0] + " " + tempArr[1] + " " + tempArr[2]
  }

  onTransfer = () => {
    this.inputSrcTmplName = this.tmplName;
    this.inputSrcEffDtTm = this.getCurEffDtTm();
    this.inputTgtTmplName = this.tmplName;
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
    this.deleteModalVisible = !this.deleteModalVisible
  }

  onConvert = () => {

  }

  onSubmit = () => {
    this.performAction(this.gConst.SUBMIT_CMD_SIGN);
  }

  onSave = () => {
    this.performAction(this.gConst.SAVE_CMD_SIGN)
  }

  onRevert = () => {
    this.bRevertClicked = true;
    this.confirmationService.confirm({
      message: 'The data that you modified will be lost. Are you sure you wish to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.bRevertClicked) 
          this.doRevert()
        else
          this.doAnotherTemplate()
      },
      reject: (type: any) => {
          switch(type) {
              case ConfirmEventType.REJECT:
                if (this.bRevertClicked)
                  this.bRevertClicked = false;
                else
                  this.cancelAnotherTemplate()
                break;
              case ConfirmEventType.CANCEL:
                break;
          }
      }
    });
  }

  doRevert = () => {
    let activeMainTab = this.activeMainTab
    let activeAOSTab = this.activeAOSTab
    let activeCarrierTab = this.activeCarrierTab
    let activeCPRTab = this.activeCPRTab
    let activeLADTab = this.activeLADTab

    // console.log("doRevert lastActionState: " + JSON.stringify(this.cprGridData))
    // this.setState(JSON.parse(JSON.stringify(this.lastActionState)));
    this.bEditEnable = false;
    this.disable = false;
    this.activeMainTab = activeMainTab;
    this.activeAOSTab = activeAOSTab;
    this.activeCarrierTab = activeCarrierTab;
    this.activeCPRTab = activeCPRTab;
    this.activeLADTab = activeLADTab;


    // console.log("doRevert this state: " + JSON.stringify(this.cprGridData))
  }

  doAnotherTemplate = async () => {

    if (await this.retrieveTemplateRecord(this.tmplNameParam, this.effDtTmParam, true)) {
      this.inputMessage = TAD_RETRIEVE_SUCCESSFUL;
    }
  };

  /**
   * this function is called at clicking the no button on the modal asking if will retrieve another template record
   */
  cancelAnotherTemplate = () => {
    if (this.preEffDtTmStat !== '')
    this.selectEffDtTmStat = this.preEffDtTmStat
  };

  toggleCancel = async () => {
    this.confirmationService.confirm({
      message: 'Are you sure you wish to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (this.action != this.gConst.ACTION_NONE) {
          this.unlockTemplateRecord()
        }
        
        this.selectPriIntraLT = ''
        this.selectPriInterLT = ''
        this.selectTimezone = 'C'
        this.inputDayLightSaving = gFunc.isCurrentDayLightSavingTime();
        this.inputSearchTmplName = '';
        this.inputSearchEffDtTm = '';
        this.bRetrieveEnable = true;
        this.bExpRetrieve = true;
        this.bExpResult = false;
        this.bEffDtTmListHidden = true;
        this.selectEffDtTmStat = '';
        this.resultCardTitle = 'Result'
        this.bRetrieveCardIconHidden = false;
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

  performAction = (cmd: string) => {
    switch (this.action) {
      case this.gConst.ACTION_NONE:
      case this.gConst.ACTION_UPDATE:
        this.updateTemplateRecord(cmd)
        break
      case this.gConst.ACTION_CREATE:
        this.createTemplateRecord(cmd)
        break
      case this.gConst.ACTION_COPY:
        this.copyTemplateRecord(cmd)
        break
      case this.gConst.ACTION_TRANSFER:
        this.transferTemplateRecord(cmd)
        break
      case this.gConst.ACTION_DISCONNECT:
        this.disconnectTemplateRecord(cmd)
        break
      case this.gConst.ACTION_DELETE:
        break
    }
  }

  transferTemplateRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }

    let ro = this.store.getCurrentRo();
    let body = await this.getTransferRequestBody(cmd)

    let res = await new Promise<any>(resolve=>{
      this.api.transferTmplRec({ro: ro, body: JSON.stringify(body)}).subscribe(res=> {
        resolve(res);
      });
    });
    if (res.success) {
      // let data = res
      // if (data.recVersionId != undefined && data.recVersionId != null) {
      //   this.recVersionId = data.recVersionId;
      // }

      // if (await this.retrieveTemplateRecord(body.tgtTmplName, res.effDtTm)) {
      //   this.showSuccess(TAD_TRANSFER_SUCCESSFUL);
      //   this.inputMessage = TAD_TRANSFER_SUCCESSFUL;
      //   this.action = this.gConst.ACTION_NONE
      // }

    }

    return true
  }

  /**
   * calls disconnect template record request
   * @param cmd: 'U' or 'S'
   * @returns {Promise<void>}
   */
  disconnectTemplateRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }
    let ro = this.store.getCurrentRo();
    let body = await this.getDisconnectRequestBody(cmd)

    let res = await new Promise<any>(resolve=>{
      this.api.disconnectTmplRec({ro: ro, body: JSON.stringify(body)}).subscribe(res=>{
        resolve(res);
      });
    });

    if (res.success) {
      // let data = res
      // if (data.recVersionId != undefined && data.recVersionId != null) {
      //   this.recVersionId = data.recVersionId;
      // }

      // // no error, update successful
      // if (await this.retrieveTemplateRecord(body.tgtTmplName, res.effDtTm)) {
      //   this.showSuccess(TAD_DISCONNECT_SUCCESSFUL);
      //   this.inputMessage = TAD_DISCONNECT_SUCCESSFUL;
      //   this.action = this.gConst.ACTION_NONE
      // }
    }

    return true
  }

  copyTemplateRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }
    let ro = this.store.getCurrentRo();
    let body = await this.getCopyRequestBody(cmd)
    console.log(body);
    let res = await new Promise<any>(resolve=>{
      this.api.copyTmplRec({ro: ro, body: JSON.stringify(body)}).subscribe(res=>{
        resolve(res);
      });
    });

    if (res.success) {
      // let data = res
      // if (data.recVersionId != undefined && data.recVersionId != null) {
      //   this.recVersionId = data.recVersionId;
      // }

      // // no error, update successful
      // if (await this.retrieveTemplateRecord(body.tgtTmplName, res.effDtTm)) {
      //   this.showSuccess(TAD_COPY_SUCCESSFUL);
      //   this.inputMessage = TAD_COPY_SUCCESSFUL;
      //   this.action = this.gConst.ACTION_NONE
      // }
    }
    return true
  }

  createTemplateRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }
    let ro = this.store.getCurrentRo();
    let body = await this.getCreateRequestBody(cmd)

    let res = await new Promise<any>(resolve => {
      this.api.createTmplRec({ro: ro, body: JSON.stringify(body)}).subscribe(res => {
        resolve(res);
      });
    });

    if (res.success) {
      // let data = res
      // if (data.recVersionId !== undefined && data.recVersionId != null) {
      //   this.recVersionId = data.recVersionId;
      // }
      // // no error, update successful
      // if (await this.retrieveTemplateRecord(body.tmplName, body.effDtTm)) {
      //   this.showSuccess(TAD_CREATE_SUCCESSFUL);
      //   this.inputMessage = TAD_CREATE_SUCCESSFUL
      //   this.action = this.gConst.ACTION_NONE
      // }
    }

    return true;
  };

  updateTemplateRecord = async (cmd: string) => {

    if (!this.checkValidation()) {
      return false
    }

    let ro = this.store.getCurrentRo();
    let body = await this.getUpdateRequestBody(cmd)

    let res: any;
    res = await new Promise<any>(resolve => {
      this.api.updateTmplRec({ro: ro, body: JSON.stringify(body)}).subscribe(res=> {
        resolve(res);
      });
    });

    if (res.success) {
      // let data = res
      // if (data.recVersionId != null) {
      //   this.recVersionId = data.recVersionId
      // }

      // // no error, update successful
      // if (await this.retrieveTemplateRecord(body.tmplName, body.effDtTm)) {
      //   this.showError(TAD_UPDATE_SUCCESSFUL, '');
      //   this.inputMessage = TAD_UPDATE_SUCCESSFUL;
      // }
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
    let cprSectName = await this.getCprSect();
    let lblList = await this.getLabelData();

    let priIntraLT = this.selectPriIntraLT
    let priInterLT = this.selectPriInterLT

    let intraLATACarrier: any = [];
    if (this.inputIntraLATACarrier !== '') {
      intraLATACarrier = this.inputIntraLATACarrier.replace(/\ /g, "").split(",")
    }

    let interLATACarrier: any = []
    if (this.inputInterLATACarrier !== '') {
      interLATACarrier = this.inputInterLATACarrier.replace(/\ /g, "").split(",")
    }

    let aos: any = {}
    let aosNet = this.inputNetwork
    if (aosNet != '')
      aos.aosNet = aosNet.replace(/\ /g, "").split(",")
    else
      aos.aosNet = []

    let aosState = this.inputState
    if (aosState != '')
      aos.aosState = aosState.replace(/\ /g, "").split(",")
    else
      aos.aosState = []

    let aosNPA = this.inputNpa
    if (aosNPA != '')
      aos.aosNPA = aosNPA.replace(/\ /g, "").split(",")
    else
      aos.aosNPA = []

    let aosLATA = this.inputLata
    if (aosLATA != '')
      aos.aosLATA = aosLATA.replace(/\ /g, "").split(",")
    else
      aos.aosLATA = []

    let aosLbl = this.inputLabel
    if (aosLbl != '')
      aos.aosLbl = aosLbl.replace(/\ /g, "").split(",")
    else
      aos.aosLbl = []

    let body: any = {
      cmd: cmd,
      priority: this.inputPriority ? 'Y' : 'N',
      tmplDesc: this.inputDescription,
      conName: this.inputContactName,
      conTel: this.inputContactNumber.replace(/\-/g, ""),
      notes: this.inputNotes,
      numTermLine: this.inputLine,
      aos: aos,
      dayLightSavings: this.inputDayLightSaving ? 'Y' : 'N',
    }

    if (intraLATACarrier?.length)
      body.intraLATACarrier = intraLATACarrier
    else
      body.intraLATACarrier = []

    if (interLATACarrier?.length)
      body.interLATACarrier = interLATACarrier
    else
      body.interLATACarrier = []

    if (cprSectName?.length)
      body.cprSectName = cprSectName
    else
      body.cprSectName = []

    if (lblList?.length)
      body.lbl = lblList
    else
      body.lbl = []

    if (priIntraLT != null && priIntraLT !== '')
      body.priIntraLT = priIntraLT

    if (priInterLT != null && priInterLT !== '')
      body.priInterLT = priInterLT

    if (Boolean(this.selectTimezone))
      body.tmZn = this.selectTimezone

    return body
  }

  /**
   * get the content of create request
   */
  getCreateRequestBody = async (cmd: string) => {

    let body: any = await this.getCommonRequestBody(cmd)

    body.tmplName = this.tmplName

    let effDtTm = "NOW"
    if (!this.inputCreateNow)
      effDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputCreateEffDtTm))
    body.effDtTm = effDtTm

    body.ctrlRespOrgId = this.inputRespOrg

    return body
  }

  /**
   * get the content of update request
   */
  getUpdateRequestBody = async (cmd: string) => {

    let body: any = await this.getCommonRequestBody(cmd)

    body.tmplName = this.tmplName
    body.effDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    body.recVersionId = this.recVersionId
    body.dscInd = this.inputDscInd ? 'Y' : 'N'

    return body
  }

  /**
   * get the content of transfer request
   */
  getTransferRequestBody = async (cmd: any) => {
    let body: any = await this.getCommonRequestBody(cmd)

    // if moving from cad to tad
    if (this.lockParam.srcNum)
      body.srcNum = this.lockParam.srcNum
    else
      body.srcTmplName = this.inputSrcTmplName

    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)
    body.srcRecVersionId = this.srcRecVersionId
    body.dscInd = this.inputDscInd ? 'Y' : 'N'

    body.tgtTmplName = this.tmplName
    if (this.selectEffDtTmStat == "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    body.tgtRecVersionId = this.recVersionId

    // configs component part
    body.tmplRecCompPart = this.lockParam.tmplRecCompPart
    body.overWriteTGT = 'Y'

    return body
  }

  /**
   * get the content of copy request
   */
  getCopyRequestBody = async (cmd: string) => {

    // console.log("cpr grid data: " + this.cprGridData)

    let body: any = await this.getCommonRequestBody(cmd)

    body.ctrlRespOrgId = this.inputRespOrg

    // if moving from cad to tad
    if (this.lockParam.srcNum)
      body.srcNum = this.lockParam.srcNum
    else
      body.srcTmplName = this.inputSrcTmplName

    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)
    // if
    body.srcRecVersionId = this.srcRecVersionId
    // body.dscInd = this.state.dscInd ? 'Y' : 'N'

    body.tgtTmplName = this.tmplName
    if (this.selectEffDtTmStat === "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
    body.tgtRecVersionId = this.recVersionId

    // configs component part
    body.tmplRecCompPart = this.lockParam.tmplRecCompPart
    body.overWriteTGT = 'Y'

    return body
  }

  /**
   * get the content of disconnect request
   */
  getDisconnectRequestBody = async (cmd: string) => {

    let body: any = await this.getCommonRequestBody(cmd)

    // if moving from cad to tad
    if (this.lockParam.srcNum)
      body.srcNum = this.lockParam.srcNum
    else
      body.srcTmplName = this.inputSrcTmplName

    body.srcEffDtTm = gFunc.fromCTStrToUTCStr(this.inputSrcEffDtTm)
    body.srcRecVersionId = this.srcRecVersionId

    body.tgtTmplName = this.tmplName
    if (this.selectEffDtTmStat === "NOW")
      body.tgtEffDtTm = "NOW"
    else
      body.tgtEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // configs component part
    let tmplRecCompPart = ''
    if (this.portionCR) {   // entire components
      tmplRecCompPart = "TAD"
    }

    if (this.portionLAD) {
      tmplRecCompPart += (tmplRecCompPart == '') ? '' : ', '
      tmplRecCompPart += "LAD"
    }

    if (this.portionCPR) {
      tmplRecCompPart += (tmplRecCompPart == '') ? '' : ', '
      tmplRecCompPart += "CPR"
    }

    body.tmplRecCompPart = tmplRecCompPart
    body.overWriteTGT = 'Y'

    return body
  }

  closeCopyModal = () => {
    this.copyModalVisible = false;
  }

  copyDate = () => {

  }

  handleCheckOnModal = (event: any, targetName: string) => {
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
  }

  checkValidForCopying = async () => {
    if (!this.inputCopyNow && !Boolean(this.inputTgtEffDtTm)) {
      this.validMsg = "Please input effective date/time";
      this.showInfo('Please input effective date/time');
      return
    }

    switch (this.radioCopyAction) {
      case this.gConst.COPYACTION_CHANGE:
        break
      case this.gConst.COPYACTION_DISCONNECT:
        if (this.inputSrcTmplName !== this.inputTgtTmplName) {
          this.validMsg = "Copy of a Disconnect TR is allowed only to the same Template Name";
          this.showInfo('Copy of a Disconnect TR is allowed only to the same Template Name');
          return
        }
        if (this.inputDscInd) {
          this.validMsg = "Action must be Change or New";
          this.showInfo('Action must be Change or New');
          return
        }
        break
      case this.gConst.COPYACTION_NEW:
        if (this.inputSrcTmplName === this.inputTgtTmplName) {
          this.validMsg = "Action must be Change or Disconnect";
          this.showInfo('Action must be Change or Disconnect');
          return
        }
        break
    }

    if (!this.portionCR && !this.portionCPR && !this.portionLAD) {
      this.validMsg = "Select at least one checkbox";
      this.showInfo('Select at least one checkbox');
      return
    }

    // gets source date time
    let srcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      let d = new Date(this.inputTgtEffDtTm).getTime();
      tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z';
    }

    // configs component part
    let tmplRecCompPart = ''
    if (this.portionCR) {   // basic
      tmplRecCompPart = "TAD"
    }

    // LAD data
    if (this.portionLAD) {
      tmplRecCompPart += (tmplRecCompPart == '') ? '' : ', '
      tmplRecCompPart += "LAD"
    }

    // CPR data
    if (this.portionCPR) {
      tmplRecCompPart += (tmplRecCompPart == '') ? '' : ', '
      tmplRecCompPart += "CPR"
    }

    this.action = this.gConst.ACTION_COPY;
    let custRecAction = this.gConst.ACTION_COPY;
    if (this.inputDscInd || this.radioCopyAction === this.gConst.COPYACTION_DISCONNECT) {
      this.action = this.gConst.ACTION_DISCONNECT;
      custRecAction = this.gConst.ACTION_DISCONNECT;
    }

    let ro = this.store.getCurrentRo();
    // configs parameter for calling lock api
    let body = {
      custRecAction: custRecAction,
      overWriteTGT: 'Y',
      srcTmplName: this.inputSrcTmplName,
      srcEffDtTm: srcEffDtTm,
      tgtTmplName: this.inputTgtTmplName,
      tgtEffDtTm: tgtEffDtTm,
      tmplRecCompPart: tmplRecCompPart,
    }
    
    let res = await new Promise<any>(resolve=>{
      this.api.tmplLock({ro: ro, body: JSON.stringify(body)}).subscribe(res=> {
        resolve(res);
      });
    })

    if (res) {
      if ((res.copyStatus && res.copyStatus.isAllowed === 'Y')
        || (res.disconnectStatus && res.disconnectStatus.isAllowed === 'Y')) {

        this.srcRecVersionId = this.recVersionId
        this.lockParam = body;

        let utcTgtEffDtTm = body.tgtEffDtTm
        if (utcTgtEffDtTm === "NOW")
          utcTgtEffDtTm = gFunc.getUTCString(new Date())

        // if create template
        if (body.srcTmplName !== body.tgtTmplName) {
          await this.retrieveTmplForTgtTmpl(body.tgtEffDtTm)
          return
        }

        let nextUtcEffDtTm = ""
        let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)
        if (index + 1 < this.effDtTmStatList.length)
          nextUtcEffDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index + 1])

        // if target date time is future than current template date time, no need to retrieve
        let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
        if (utcEffDtTm < utcTgtEffDtTm) {

          // if next effective date time is selected, retrieve next.
          if (nextUtcEffDtTm === utcTgtEffDtTm) {
            await this.retrieveTmplForTgtTmpl(nextUtcEffDtTm)
            return
          }

          if (!this.portionCPR) // if no select for the CPR, initialize the CPR
            this.initCPRData()

          if (!this.portionLAD) // if no select for the LAD, initialize the LAD
            this.ladGridData = Array(9).fill('').map(dd=>([]));

        } else { // if target date time is before than current template date time, should retrieve the before record.
          let effDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index - 1])
          await this.retrieveTmplForTgtTmpl(effDtTm)
          return
        }

        let effDtTmStat = "NOW"
        if (body.tgtEffDtTm != "NOW")
          effDtTmStat = gFunc.fromUTCStrToCTStr(body.tgtEffDtTm)
        let effDtTmStatList = [effDtTmStat]

        this.effDtTmStatList = effDtTmStatList;
        this.selectEffDtTmStat = effDtTmStat;
        this.tmplName = body.tgtTmplName;

        this.finishCpyTrnsfrOp()
        return
      }
    }
  }

  unlockTemplateRecord = async () => {
    let lockParam = this.lockParam

    // if tgtTmplName exists, that means this is the state that moves from CAD to TAD. Should not unlock.
    if (lockParam && lockParam.custRecAction) {
      let ro = this.store.getCurrentRo();
      let body: any = {}

      switch (lockParam.custRecAction) {
        case this.gConst.ACTION_COPY:
        case this.gConst.ACTION_TRANSFER:
        case this.gConst.ACTION_DISCONNECT:
          body.tmplName = lockParam.tgtTmplName
          if (lockParam.tgtEffDtTm !== "NOW")    // if now
            body.effDtTm = lockParam.tgtEffDtTm
          break

        case this.gConst.ACTION_UPDATE:
          body.tmplName = lockParam.srcTmplName
          body.effDtTm = lockParam.srcEffDtTm
          break
      }

      await new Promise<void>((resolve, reject)=>{
        this.api.tmplUnLock({ro: ro, body: JSON.stringify(body)}).subscribe(res=> {
          this.lockParam = {};
          resolve();
        }, err=> {
          this.lockParam = {};
          reject();
        });
      })
    }
  }

  closeDeleteModal = () => {
    this.deleteModalVisible = false;
  }

  deleteTemplateRecord = () => {
    this.toggleDelete()

    let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)  // YYYY-MM-DDTHH:mmZ
    let ro = this.store.getCurrentRo();
    let params = {
      tmplName: this.tmplName, 
      effDtTm: utcEffDtTm, 
      recVersionId: this.recVersionId, 
      ro: ro
    }

    this.api.deleteTmplRec({ro: ro, body: JSON.stringify(params)}).subscribe(res=> {
      if (res) {
        this.showSuccess(TAD_DELETE_SUCCESSFUL);
        this.inputMessage = ''

        let effDtTmListSize = this.effDtTmStatList.length

        if (this.effDtTmStatList.length == 1) { // only one record, goes to initial state of page
          this.cancelAction()
        } else { // if next record exists, shows next record, else shows previous record

          // gets index
          let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)
          if (index == effDtTmListSize - 1) {
            index--
          }

          // gets effective date time based on index and retrieves template record
          let newEffDtTm = this.effDtTmStatList[index]
          let utcEffDtTm = gFunc.fromCTStrToUTCStr(newEffDtTm)
          this.retrieveTemplateRecord(this.tmplName, utcEffDtTm)
        }

        return
      }
    });
  }

  /**
   * cancel template admin data
   * @returns {Promise<boolean>}
   */
  cancelAction = async () => {

    if (this.action != this.gConst.ACTION_NONE) {
      await this.unlockTemplateRecord()
    }

    this.selectPriIntraLT = ''
    this.selectPriInterLT = ''
    this.selectTimezone = 'C'
    this.inputDayLightSaving = gFunc.isCurrentDayLightSavingTime();
    this.inputSearchTmplName = '';
    this.inputSearchEffDtTm = '';
    this.bRetrieveEnable = true;
    this.bExpRetrieve = true;
    this.bExpResult = false;
    this.bEffDtTmListHidden = true;
    this.selectEffDtTmStat = '';
    this.resultCardTitle = 'Result'
  };

  checkValidForTransferring = async () => {

    // gets source date time
    let srcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)

    // gets target date time
    let tgtEffDtTm = "NOW"
    if (!this.inputCopyNow) {
      if (!Boolean(this.inputTgtEffDtTm)) {
        this.validMsg = 'Please input effective date/time'
        return
      }
      // tgtEffDtTm = gFunc.fromCTTimeToUTCStr(new Date(this.inputTgtEffDtTm))
      let d = new Date(this.inputTgtEffDtTm).getTime();
      tgtEffDtTm = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'; 
    }

    // configs component part
    let tmplRecCompPart = ''
    if (this.portionEntire) {   // entire components
      tmplRecCompPart = "TAD"
      if (!this.noLAD) {
        tmplRecCompPart += ", LAD"
      }
      if (!this.noCPR) {
        tmplRecCompPart += ", CPR"
      }

    } else {                        // individual components (CPR or LAD or CPR, LAD)
      if (this.portionLAD) {
        tmplRecCompPart += (tmplRecCompPart == '') ? '' : ', '
        tmplRecCompPart += "LAD"
      }
      if (this.portionCPR) {
        tmplRecCompPart += (tmplRecCompPart == '') ? '' : ', '
        tmplRecCompPart += "CPR"
      }
    }

    let ro = this.store.getCurrentRo();
    // configs parameter for calling lock api
    let body = { 
      custRecAction: this.gConst.ACTION_TRANSFER,
      overWriteTGT: 'Y',
      srcTmplName: this.inputSrcTmplName,
      srcEffDtTm: srcEffDtTm,
      tgtTmplName: this.inputTgtTmplName,
      tgtEffDtTm: tgtEffDtTm,
      tmplRecCompPart: tmplRecCompPart
    }
  
    await new Promise<void>(resolve=>{
      this.api.tmplLock({ro: ro, body: JSON.stringify(body)}).subscribe(async (res)=> {
        if (res) {
          if (res.transferStatus.isAllowed === 'Y') {
    
            this.srcRecVersionId = this.recVersionId;
            this.lockParam = body;
    
            if (!this.portionEntire) {
    
              let utcTgtEffDtTm = body.tgtEffDtTm
              if (utcTgtEffDtTm === "NOW")
                utcTgtEffDtTm = gFunc.getUTCString(new Date())
    
              let nextUtcEffDtTm = ""
              let index = this.effDtTmStatList.indexOf(this.selectEffDtTmStat)
              if (index + 1 < this.effDtTmStatList.length)
                nextUtcEffDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index + 1])
    
              // if target date time is future than current template date time, no need to retrieve
              let utcEffDtTm = this.fromEffDtTmStatToUTCStr(this.selectEffDtTmStat)
              if (utcEffDtTm < utcTgtEffDtTm) {
    
                // if next effective date time is selected, retrieve next.
                if (nextUtcEffDtTm === utcTgtEffDtTm) {
                  await this.retrieveTmplForTgtTmpl(nextUtcEffDtTm)
                  return
                }
    
                if (!this.portionCPR) // if no select for the CPR, initialize the CPR
                  this.initCPRData()
    
                if (!this.portionLAD) // if no select for the LAD, initialize the LAD
                  this.ladGridData = Array(9).fill('').map(dd=>([]));
    
              } else { // if target date time is before than current template date time, should retrieve the before record.
    
                let effDtTm = this.fromEffDtTmStatToUTCStr(this.effDtTmStatList[index - 1])
                await this.retrieveTmplForTgtTmpl(effDtTm)
                return
              }
            }
    
            let effDtTmStat = "NOW"
            if (body.tgtEffDtTm != "NOW")
              effDtTmStat = gFunc.fromUTCStrToCTStr(body.tgtEffDtTm)
            let effDtTmStatList = [effDtTmStat]
    
            this.effDtTmStatList = effDtTmStatList;
            this.selectEffDtTmStat = effDtTmStat;
            this.tmplName = body.tgtTmplName;
    
            this.finishCpyTrnsfrOp()
            return
          }
        }
        resolve();
      });
    })

    this.action = this.gConst.ACTION_TRANSFER;
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
   * retrieve target template record that is set on the copy modal or transfer modal
   * effDtTm : effective date time to retrieve
   */
  retrieveTmplForTgtTmpl = (effDtTm: string) => {
    let ro = this.store.getCurrentRo();
    let params = { tmplName: this.lockParam.tgtTmplName, effDtTm: effDtTm.replace(/[-|:]/g, ''), ro: ro, isUserAct: false }
    // console.log("retrieveTmplForTgtTmpl: " + params.tmplName + ", " + params.effDtTm)
    
    this.api.tmplAdminDataRetrieve(ro, params.tmplName, effDtTm).subscribe(res=> {
      if (res) {
        let data = res;
        this.tgtRetrieveData = data;

        let bOverwrite = false

        if (res.effDtTm === this.lockParam.tgtEffDtTm) {

          // if cpr data of target template record exits, should overwrite.
          if (this.portionCPR && data.cprSectName && data.cprSectName.length)
            bOverwrite = true

          // if lad data of target template record exits, should overwrite.
          if (this.portionLAD && data.lbl && data.lbl.length)
            bOverwrite = true

        }

        if (bOverwrite) {
          // asks the user if will overwrite.
          this.migrateSurAndTgtTemplate();
        } else {  // if no overwrite
          this.migrateSurAndTgtTemplate();
        }

        return
      }

      // if no result, create new record
      this.createNewTmplRecBasedOnSource()

    });
  }

  migrateSurAndTgtTemplate = async () => {
    // let srcState = this.state

    // retrieve the target template record data
    await this.reflectDataOnPage(this.lockParam.tgtTmplName, this.tgtRetrieveData)

    let effDtTmStat = "NOW"
    if (this.lockParam.tgtEffDtTm !== "NOW")
      effDtTmStat = gFunc.fromUTCStrToCTStr(this.lockParam.tgtEffDtTm)
    let effDtTmStatList = [effDtTmStat]
    this.selectEffDtTmStat = effDtTmStat
    this.effDtTmStatList = effDtTmStatList

    // if target effective date time is different from retrieved effective date time
    // that means we should take only CR data from retrieved template and take CPR or LAD from original template.
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
      this.overwriteCPRData() // overwrite the data
    }

    // for the lad data,
    if (this.portionLAD) {
      this.overwriteLADData() // overwrite the data
    }

    this.finishCpyTrnsfrOp()
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

  /**
   * initialize LAD grids
   */
  initLADGrids = () => {
    let grid = []
    for (let i =0; i < 8; i++) {
      grid.push({ lbl: "", def1: "", def2: "", def3: "", def4: "", def5: "", def6: "", def7: "" })
    }

    this.gridArea = grid.slice();
    this.gridDate = grid.slice();
    this.gridLATA = grid.slice();
    this.gridNXX = grid.slice();
    this.gridState = grid.slice();
    this.gridTel = grid.slice();
    this.gridTime = grid.slice();
    this.gridTD = grid.slice();
    this.gridSD = grid.slice();

    this.noGridArea =   true;
    this.noGridDate =   true;
    this.noGridLATA =   true;
    this.noGridNXX =    true;
    this.noGridState =  true;
    this.noGridTel =    true;
    this.noGridTime =   true;
    this.noGridTD =     true;
    this.noGridSD =     true;
    this.noLAD =        true;
  }

  /**
   *
   * @param srcState
   */
  overwriteBasicData = () => {
    this.checkDataExistForCR()
  }

  overwriteCPRData = () => {
    this.checkDataExistForCPR()
  }

  overwriteLADData = () => {
    this.checkDataExistForLAD()
  }

  createNewTmplRecBasedOnSource = () => {
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
      this.ladGridData = Array(9).fill('').map(dd=>([]));
    }

    let retrieveCardTitle = "Create a New Template: " + this.lockParam.tgtTmplName

    this.effDtTmStatList = effDtTmStatList;
    this.selectEffDtTmStat = effDtTmStat;
    this.tmplName = this.lockParam.tgtTmplName;
    this.retrieveCardTitle = retrieveCardTitle;
    this.srchNum = '',        // search number valu;
    this.numberList = [],     // because of new templat;
    this.numGrid = Array(INIT_NUM_GRID_LENGTH).fill(Array(NUM_GRID_COL_LENGTH).fill(''));
    this.noNumList = true;

    this.finishCpyTrnsfrOp()
  }

  checkValidation = () => {
    // console.log("this.state.createEffDtTm: " + this.inputCreateEffDtTm)

    let message = ''

    if (this.inputRespOrg === '') {
      message += 'Resp Org field is required.'
    }

    if (this.action === this.gConst.ACTION_CREATE && !Boolean(this.inputCreateEffDtTm) && !this.inputCreateNow) {
      message += (message === '') ? '' : '\r\n'
      message += 'Effective Date Time field is required.'
    }

    if (this.inputLine === '') {
      message += (message === '') ? '' : '\r\n'
      message += 'Number of Lines field is required.'
    }

    if (this.inputNetwork === '' && this.inputState === '' && this.inputNpa === '' && this.inputLata === '' && this.inputLabel === '') {
      message += (message === '') ? '' : '\r\n'
      message += 'At least one field of the Area of Service is required.'
    }

    if (this.inputIntraLATACarrier === '' || this.inputInterLATACarrier === '') {
      message += (message === '') ? '' : '\r\n'
      message += 'Intra and Inter Carriers are required.'
    }

    // if (!this.state.noCPR && (this.state.priIntraLT === '' || this.state.priInterLT === '')) {
    //   message += (message === '') ? '' : '\r\n'
    //   message += 'Primary carriers are required on the CPR tab.'
    // }

    if (message !== '') {
      this.showError(message, '');
      this.inputMessage = message;
      return false
    }
    return true
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
