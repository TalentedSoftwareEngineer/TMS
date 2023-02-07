import { Component, OnInit } from '@angular/core';
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
  CPR_GRID_CATEGORY_OPTIONS
} from '../../constants';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import {closeEventSource, SseClient} from "angular-sse-client";
import * as gFunc from 'src/app/utils/utils';
import produce from "immer";

@Component({
  selector: 'app-customer-admin-data',
  templateUrl: './customer-admin-data.component.html',
  styleUrls: ['./customer-admin-data.component.scss']
})
export class CustomerAdminDataComponent implements OnInit {
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
    DEFAULT_CARRIERS
  }
  
  retrieveCardTitle: string = 'Retrieve';
  bRetrieveCardIconHidden: boolean = false;
  bExpRetrieve: boolean = false;
  inputSearchNum: string = '';
  inputSearchEffDtTm: Date|null = null;
  bRetrieveEnable: boolean = false;

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
  
  inputRespOrg: string = '';
  inputCreateEffDtTm: Date|null = null;
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
  inputEndIntDtTm: string|Date|null = null;
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
  ) { }

  ngOnInit(): void {
    this.intraLATACarrierOptions = this.gConst.CARRIER_LIST.map(item=>({name: item, value: item}));
    this.interLATACarrierOptions = this.gConst.CARRIER_LIST.map(item=>({name: item, value: item}));
  }

  getPriIntraLTOptions = () => {
    let options = this.iac_array.map(item=>({name: item, value: item}));
    return [{name: 'Select', value: ''}, ...options];
  }

  getPriInterLTOptions = () => {
    let options = this.iec_array.map(item=>({name: item, value: item}));
    return [{name: 'Select', value: ''}, ...options];
  }

  onSearchNumber = () => {

  }

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

  onDeleteCpr = () => {
    this.cprDeleteModalVisible = true;
  }

  handleCarrierSelect = () => {
    this.bContentModified = true;
    this.checkDataExistForCR()
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
    console.log(this.cprGridCategory);
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

    console.log("index: " + index)
    console.log("cprGridData[index]: " + cprGridData[index])

    let activeRow = cprCurActiveRow[index] != this.gConst.INVALID_ROW ? cprCurActiveRow[index] : 0;
    cprGridData[index].splice(activeRow, 0, Array(cprGridData[index][0].length).fill(""))
    cprCurActiveRow[index] = this.gConst.INVALID_ROW

    console.log("gridData : " + cprGridData)

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
    console.log("CPRGRID: " + JSON.stringify(cprGridData))

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

    console.log("CPRGRID: " + JSON.stringify(cprGridData))

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

    console.log("index: " + index)
    console.log("ladGridData[index]: " + ladGridData[index])

    let activeRow = ladCurActiveRow[index] != this.gConst.INVALID_ROW ? ladCurActiveRow[index] : 0;
    ladGridData[index].splice(activeRow, 0, Array(ladGridData[index][0].length).fill(""))
    ladCurActiveRow[index] = this.gConst.INVALID_ROW

    console.log("gridData : " + ladGridData)

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
    console.log("CPRGRID: " + JSON.stringify(ladGridData))

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

    console.log("CPRGRID: " + JSON.stringify(ladGridData))

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
