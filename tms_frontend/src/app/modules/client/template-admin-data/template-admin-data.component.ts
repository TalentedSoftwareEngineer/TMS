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
  INIT_NUM_GRID_LENGTH
} from '../../constants';
import produce from "immer";
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';

@Component({
  selector: 'app-template-admin-data',
  templateUrl: './template-admin-data.component.html',
  styleUrls: ['./template-admin-data.component.scss']
})
export class TemplateAdminDataComponent implements OnInit {

  gConst = {
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
    INVALID_ROW
  }

  retrieveCardTitle: string = 'Retrieve';
  bRetrieveCardIconHidden: boolean = false;
  bExpRetrieve: boolean = false;
  inputSearchTmplName: string = '';
  validTmplName: boolean = true;
  inputSearchEffDtTm: any = null;
  bRetrieveEnable: boolean = false;

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
  inputCreateEffDtTm: Date|null = null;
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

  noCR: boolean = true;
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
  cprDelSectModalVisible: boolean = false;    // section delete modal visible

  iac_array: any[] = this.gConst.DEFAULT_CARRIERS // intraLATACarrier list
  iec_array:  any[] = this.gConst.DEFAULT_CARRIERS // interLATACarrier list

  //CPR Tab
  cprSectNames: any[] = ["MAIN"];
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

  ngOnInit(): void {
    this.store.state$.subscribe(async (state)=> {
      if(state.user.permissions?.includes(PERMISSIONS.TAD)) {
      } else {
        // no permission
        this.showWarn("You have no permission for this page")
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }
    })
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

  /**
   * this function is called at clicking the retrieve button of the retrieve card.
   */
  async onSearchTemplate() {

    if (!this.gConst.TMPLNAME_REG_EXP.test(this.inputSearchTmplName)) {
      this.validTmplName = false;
      return
    }

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

    } else if (this.retrieveTemplateRecord(this.inputSearchTmplName, searchUTCString, true)) {
      // NotificationManager.success("", TAD_RETRIEVE_SUCCESSFUL)
      this.inputMessage = TAD_RETRIEVE_SUCCESSFUL;
    }
  }

  /**
   * retrieve template record.
   * @param tmplName
   * @param effDtTm: UTC time string of YYYY-MM-DDTHH:mmZ type
   * @returns {Promise<void>}
   */
  retrieveTemplateRecord = (tmplName: string, effDtTm:string, isUserAct: boolean = false) => {
    this.bRetrieveEnable = false;

    if (effDtTm != "NOW")
      effDtTm = effDtTm.replace(/\-/g, "").replace(":", "");
    let params = { tmplName: tmplName, effDtTm: effDtTm, roId: this.store.getCurrentRo, isUserAct: isUserAct }

    // let res = await this.props.callApi2(RestApi.retrieveTmplRec, params)

    // if (res.ok && res.data) {

    //   this.unlockTemplateRecord()

    //   let errList = res.data.errList

    //   let errCode = ""

    //   // if no result, shows the message if moves to create mode
    //   if (errList && errList[0].errLvl === "ERROR") {
    //     errCode = errList[0].errCode
    //     if (errCode === "540002") {
    //       let errMsg = gFunc.synthesisErrMsg(errList)
    //       NotificationManager.error("", errMsg)

    //     } else {
    //       if (errCode === "540001") {
    //         this.setState({createModalVisible: true, bRetrieveEnable: true})

    //       } else {
    //         let errMsg = gFunc.synthesisErrMsg(errList)
    //         NotificationManager.error("", errMsg)
    //         this.setState({bRetrieveEnable: true})
    //       }

    //       return false
    //     }
    //   }

    //   await this.reflectDataOnPage(tmplName, res.data)
    //   this.backupStateToLastAction()
    //   return true
    // }

    this.bRetrieveEnable = true;

    // if (res.data && res.data.errList) {
    //   let errList = res.data.errList

    //   console.log(">>> error found")

    //   if (errList[0].errCode === "540001") {
    //     this.setState({createModalVisible: true})

    //   } else {
    //     console.log(">>> error notification")

    //     let errMsg = gFunc.synthesisErrMsg(errList)
    //     NotificationManager.error('', errMsg)
    //   }

    //   this.setState({message: gFunc.synthesisErrMsg(res.data.errList)})

    //   return false
    // }

    return false;
  };

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
      this.tmplNameParam = this.tmplName;
      this.effDtTmParam = UTCTimeStr;
      this.preEffDtTmStat = this.selectEffDtTmStat;
      this.modifiedModalVisible = true
    } else if (this.retrieveTemplateRecord(this.tmplName, UTCTimeStr, true)) {
      // NotificationManager.success("", TAD_RETRIEVE_SUCCESSFUL)
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
