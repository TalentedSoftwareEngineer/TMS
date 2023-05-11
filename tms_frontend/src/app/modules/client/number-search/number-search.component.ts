import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {StoreService} from "../../../services/store/store.service";
import {ApiService} from "../../../services/api/api.service";
import {ConfirmationService, ConfirmEventType, MessageService} from "primeng/api";
import { Table } from 'primeng/table';
import {
  PERMISSION_TYPE_ALL,
  PERMISSION_TYPE_READONLY,
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
  NUS_SUBMIT_TYPE_SEARCH,
  NUS_SUBMIT_TYPE_RESERVE,
  NUS_SUBMIT_TYPE_SRCHRES,
  PHONE_NUMBER_WITH_HYPHEN_REG_EXP, ROWS_PER_PAGE_OPTIONS, SUPER_ADMIN_ROLE_ID, PAGE_NO_PERMISSION_MSG, rowsPerPageOptions
} from '../../constants';
import { tap } from "rxjs/operators";
import * as gFunc from 'src/app/utils/utils';
import {closeEventSource, SseClient} from "angular-sse-client";
import {environment} from "../../../../environments/environment";
import moment from 'moment';
import { Router } from '@angular/router';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import { IUser } from 'src/app/models/user';

@Component({
  selector: 'app-number-search',
  templateUrl: './number-search.component.html',
  styleUrls: ['./number-search.component.scss']
})
export class NumberSearchComponent implements OnInit, OnDestroy {
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
    NUS_SUBMIT_TYPE_SEARCH,
    NUS_SUBMIT_TYPE_RESERVE,
    NUS_SUBMIT_TYPE_SRCHRES
  }

  @ViewChild('numbersTable') numbersTable!: Table;

  permission = PERMISSION_TYPE_ALL

  permissionTypeAll = PERMISSION_TYPE_ALL
  permissionTypeReadOnly = PERMISSION_TYPE_READONLY

  pageSize = 10
  pageIndex = 1
  filterValue = ''
  sortActive = 'sub_dt_tm'
  sortDirection = 'DESC'

  totalCount = -1
  resultsLength = -1
  isLoading = true

  rowsPerPageOptions: any = rowsPerPageOptions
  noNeedRemoveColumn = true
  noNeedEditColumn = false

  validContactInfo: boolean = true;

  input_quantity: number = 1;
  validQty: boolean = true;
  input_consecutive: boolean = false;
  disableCons: boolean = false;
  inputNumberMaskEntry: string = '';
  invalidNumType: number = INVALID_NUM_TYPE_NONE;
  inputCsvFile: any;
  npas: any[] = [
    {name: 'Toll-Free NPA', value: ''},
    {name: '800', value: '800'},
    {name: '833', value: '833'},
    {name: '844', value: '844'},
    {name: '855', value: '855'},
    {name: '866', value: '866'},
    {name: '877', value: '877'},
    {name: '888', value: '888'}
  ];
  inputNpa = {name: 'Toll-Free NPA', value: ''}
  inputNxx: string = '';
  validNxx: boolean = true; // the flag to represent that nxx value is valid
  inputLine: string = '';
  validLine: boolean = true;
  inputMessage: string = '';
  disableSearch: boolean = false;

  numType: string = OCA_NUM_TYPE_RANDOM;
  results: any[] = [];
  userId: number =  -1;

  //View Modal
  flagOpenModal: boolean = false;
  resultQuantity: string = '';
  resultNpa: string = '';
  resultConsecutive: string = '';
  resultNxx: string = '';
  resultWildCardNum: string = '';
  resultLine: string = '';
  resultTotal: number = -1;
  filterResultLength = -1

  numberList: any[] = [];
  filterNumberList: any[] = [];
  selectedNumbers: any[] =[];
  numberListLoading: boolean = false;
  filterStatus: any[] = [
    {label: 'SPARE', value: 'SPARE'},
  ];

  viewedResult: any;

  //Toll-Free Number Info Modal
  flagNumberOpenModal: boolean = false;
  numModalNum: string = '';
  numModalStatus: string = '';
  numModalReservedUntil: string = '';
  numModalRespOrg: string = '';
  numModalEffDate: string = '';
  numModalLastActive: string = '';
  inputNumListFilterKey: string = '';

  progressingReq: any[] = [];
  completedReq: any[] = [];

  isSuperAdmin: boolean = false;
  userOptions: any[] = [];
  selectUser: string|number = '';

  streamdata_id: string = '/'+Math.floor(Math.random()*999999);

  constructor(
    public store: StoreService,
    public api: ApiService,
    private sseClient: SseClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
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
      this.isSuperAdmin = state.user.role_id == SUPER_ADMIN_ROLE_ID;
    })

    if(this.store.getUser().permissions?.includes(PERMISSIONS.SEARCH_NUMBER)) {
    } else {
      // no permission
      this.showWarn(PAGE_NO_PERMISSION_MSG)
      await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
      this.router.navigateByUrl(ROUTES.dashboard)
      return
    }

    await this.getData();
    this.getUsersList();

    this.userId = this.store.getUser().id;

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id+this.streamdata_id, { keepAlive: true }).subscribe(data => {
      if(data.page.toUpperCase()=='NSR') {
        if(data.status.toUpperCase()=='IN PROGRESS') {
          let progressingReqIndex = this.progressingReq.findIndex(req=>req.req.id==data.req.id);
          if(progressingReqIndex==-1) {
            this.progressingReq.push(data);
          } else {
            this.progressingReq.splice(progressingReqIndex, 1, data);
          }
        } else {
          if(data.total == data.failed + data.completed) {
            // Remove progressingReq Item
            let progressingReqIndex = this.progressingReq.findIndex(req=>req.req.id==data.req.id);
            if(progressingReqIndex != -1) {
              this.progressingReq.splice(progressingReqIndex, 1);
            }
            //Add completedReq Item
            let completedReqItem = this.completedReq.find(req=>req.req.id==data.req.id);
            if(completedReqItem==undefined) {
              this.completedReq.push(data);
            }
            // Alert
            if(data.completed==0) {
              this.showError(`${data.req.message.slice(0, 69)}`, `Failed`);
            } else if(data.failed==0) {
              this.showSuccess('Success!');
            } else {
              this.showInfo('Completed!');
            }
          }
        }
        // this.getNSRData();
      }
    })
  }

  ngOnDestroy(): void {
    closeEventSource(environment.stream_uri+"/"+this.userId+this.streamdata_id)
  }

  createData = (name: string, value: number) => {
    return {
      name,
      value
    };
  }

  isProgressing = (result: any) => (this.progressingReq.findIndex(req=>req.req.id==result.id)!=-1 || this.getStatus(result)=='IN PROGRESS');

  getCompleted = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.completed;
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.completed;
    } else {
      return result.completed;
    }
  }

  getStatus = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.status;
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.status;
    } else {
      return result.status;
    }
  }

  getMessage = (result: any) => {
    let completedReqItem = this.completedReq.find(req=>req.req.id==result.id);
    let progressingReqItem = this.progressingReq.find(req=>req.req.id==result.id);
    if(progressingReqItem!=undefined) {
      return progressingReqItem.req.message?.slice(0, 69);
    } else if(completedReqItem!=undefined) {
      return completedReqItem.req.message?.slice(0, 69);
    } else {
      return result.message?.slice(0, 69);
    }
  }

  async getTotalCount() {
    await this.api.getNSRCount("")
      .pipe(tap( res => {
        this.resultsLength = res.count
      })).toPromise();
  }

  getData = async () => {
    this.getTotalCount()

    await this.api.getNSRData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue, this.selectUser)
      .pipe(tap(async (res: any[])=>{
        res.map(u => {
          if(Boolean(this.store.getUser()?.timezone)) {
            // Timezone Time
            u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          } else {
            // Local time
            u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
          }
        });
        this.results = res;
      })).toPromise();

    this.filterResultLength = -1;
    await this.api.getNSRCount(this.filterValue)
    .pipe(tap( res => {
      this.filterResultLength = res.count
    })).toPromise();
  }

  getUsersList = async () => {
    try {
      await this.api.getUsersListForFilter()
        .pipe(tap(async (res: IUser[]) => {
          this.userOptions = [{name: 'All', value: ''}, ...res.map(item=>({name: item.username, value: item.id}))];
        })).toPromise();
    } catch (e) {
    }
  }

  onNumFieldFocusOut = () => {

    let num = this.inputNumberMaskEntry;
    if (num !== null && num !== "") {

      let nums = gFunc.retrieveNumListWithHyphen(num)
      nums = nums.filter((item, index)=>(nums.indexOf(item)===index));
      this.inputNumberMaskEntry = nums.join(",");

      if (num.includes('*') || num.includes('&')) { // to wildcard mode

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
          // this.disableSearch = this.input_quantity > 10;
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

        // check if the number list is valid
        let specificNumReg = SPECIFICNUM_REG_EXP
        let isValid = true
        let isNpaInvalid = false
        for (let el of nums) {
          if (!specificNumReg.test(el)) {   // if anyone among the number list is invalid, the number list is invalid.
            isValid = false

            if (!TFNPA_WILDCAD_REG_EXP.test(el))
              isNpaInvalid = true

            break
          }
        }


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
      // this.input_quantity = 1;
      // this.disableSearch = this.input_quantity > 10
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
        // this.input_consecutive = false
        // this.disableCons = true
        // this.disableSearch = true
      } else {
        // this.disableCons = false
        // this.disableSearch = false
      }
      this.disableCons = false
      this.disableSearch = false
    }

    this.onNumFieldFocusOut()
  }

  /**
   * this is called when the focus of nxx field is lost
   */
  onNXXFieldFocusOut = () => {
    let nxx = this.inputNxx
    let nxxReg = /^\d{3}$/g

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
    let lineReg = /^\d{4}$/g

    if (line === '' || lineReg.test(line)) {
      this.validLine = true;
    } else {
      this.validLine = false;
    }
  }

  onCsvXlUploadAuto = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      let file: File = event.target.files.item(0)

      const reader: FileReader = new FileReader()
      if (file.type === 'text/csv') {
        reader.readAsText(file)

        reader.onload = (e: any) => {
          const data = e.target.result;
          let arr_csvContent = String(data).split("\n");
          let phoneNumbers = arr_csvContent.filter(item=>PHONE_NUMBER_WITH_HYPHEN_REG_EXP.test(item)).map(item=>item.replace('\r', ''));
          this.inputNumberMaskEntry = phoneNumbers.toString();
          this.onNumFieldFocusOut();
        }
      }
    }
  }

  performNUS = (submitType: string): any => {

    this.inputMessage = '';

    let bPass = true
    if (!this.validQty)
      bPass = false

    if (this.invalidNumType !== this.gConst.INVALID_NUM_TYPE_NONE) {
      bPass = false
      document.getElementById('num')?.focus();
    }

    if (this.store.getContactInformation()?.name === "" || this.store.getContactInformation()?.number === "") {
      this.validContactInfo = false;

      if (bPass)  document.getElementById('contactInfoPicBtn')?.focus()
      bPass = false

    } else {
      this.validContactInfo = true;
    }

    if (!bPass)
      return false

    let body = {
      ro: this.store.getCurrentRo(),
      type: this.numType,
      submitType: submitType,
      qty: 0,
      cons: '',
      npa: '',
      nxx: '',
      line: '',
      wildCardNum: '',
      specificNums: [''],
      contactName: '',
      contactNumber: '',
      // shrtNotes: '',
    }

    if (submitType === NUS_SUBMIT_TYPE_SRCHRES) {
      body.contactName = this.store.getContactInformation()?.name
      body.contactNumber = this.store.getContactInformation()?.number.replace(/\-/g, "")

      if (body.contactName === '' || body.contactNumber === '') {
        this.inputMessage = 'Please set contact name and number.';
        return false
      }

      // if (this.store.getContactInformation().notes !== '')
      //   body.shrtNotes = this.store.getContactInformation().notes
    }

    switch (this.numType) {
      case this.gConst.OCA_NUM_TYPE_RANDOM:
        body.qty = this.input_quantity;
        // if (this.input_quantity <= 10)
          body.cons = this.input_consecutive ?  'Y' : 'N'
        if (this.inputNpa.value !== '')
          body.npa = this.inputNpa.value
        if (this.inputNxx !== '')
          body.nxx = this.inputNxx
        if (this.inputLine !== '')
          body.line = this.inputLine
        break

      case this.gConst.OCA_NUM_TYPE_SPECIFIC:
        let specificNums = gFunc.retrieveNumList(this.inputNumberMaskEntry)
        body.specificNums = specificNums
        break

      case this.gConst.OCA_NUM_TYPE_WILDCARD:
        body.qty = this.input_quantity;
        // if (this.input_quantity <= 10)
          body.cons = this.input_consecutive ?  'Y' : 'N'
        if (this.inputNpa.value !== '')
          body.nxx = this.inputNxx
        if (this.inputLine !== '')
          body.line = this.inputLine
        body.wildCardNum = this.inputNumberMaskEntry.replace(/\-/g, "")
        break
    }

    this.api.searchAndReserve(body).subscribe(res=>{
      setTimeout(()=>{
        this.sortActive = 'sub_dt_tm'
        this.sortDirection = 'DESC'
        this.getData();
      }, 100)
    });
  };

  onReset = () => {
    window.location.reload();
  }

  onOpenViewModal = async (event: Event, result: any) => {
    this.viewedResult = result;

    this.resultQuantity = result.total;
    this.resultNpa = result.npa;
    this.resultConsecutive = result.consecutive;
    this.resultNxx = result.nxx;
    this.resultWildCardNum = result.wild_card_num;
    this.resultLine = result.line;

    await this.api.getNSRById(result.id)
      .pipe(tap((response: any[])=>{
        response.map(u => {
          if(Boolean(this.store.getUser()?.timezone)) {
            // Timezone Time
            u.sub_dt_tm = u.sub_dt_tm ? moment(u.sub_dt_tm).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.updated_at = u.updated_at ? moment(u.updated_at).utc().utcOffset(Number(this.store.getUser()?.timezone)).format('MM/DD/YYYY h:mm:ss A') : '';
          } else {
            // Local time
            u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('MM/DD/YYYY h:mm:ss A') : '';
            u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('MM/DD/YYYY h:mm:ss A') : '';
          }
        });

        this.numberList = response;

        this.filterNumberList = this.numberList;
        this.inputNumListFilterKey = '';
        this.onInputNumListFilterKey();
        this.flagOpenModal = true;
        this.resultTotal = this.numberList.length
      })).toPromise();
  }

  onDownloadCsv = async (event: Event, result: any) => {
    let numsContent = '';

    await this.api.getNSRById(result.id).pipe(tap((response: any[])=>{
      response.forEach((item, index) => {
        numsContent += `\n${item.num}, ${item.status}, ${item.message==null?'':item.message}, ${item.suggested_num==null?'':item.suggested_num}`;
      });

      let data = `Type,${result.type}\nSubmitType,${result.submit_type}\nQuantity,${result.total}\nConsecutive,${result.consecutive} \nWildCardNum, ${result.wild_card_num==null?'':result.wild_card_num} \nNpa, ${result.npa==null?'':result.npa} \nNxx, ${result.nxx==null?'':result.nxx} \nLine, ${result.line==null?'':result.line} \nSubmit Date Time, ${result.sub_dt_tm} \nTotal, ${result.failed+result.completed}\nCompleted,${result.completed}\nFailed, ${result.failed}\n\nNumber,Status,Message,Suggestions${numsContent}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'Search_Reserve_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      tempLink.click();
    })).toPromise();
  }

  delete = (event: Event, id: string) => {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteNSR(id).subscribe(async res=>{
          this.showSuccess('Successfully deleted!');
          await this.getData();
        });
      },
      reject: (type: any) => {
        switch(type) {
            case ConfirmEventType.REJECT:
              // this.showInfo('Rejected');
              break;
            case ConfirmEventType.CANCEL:
              // this.showInfo('Cancelled');
              break;
        }
      }
    });
  }

  closeModal = () => {
    this.flagOpenModal = false;
  }

  closeNumberModal = () => {
    this.flagNumberOpenModal = false;
  }

  openNumberModal = async (tollFreeNumber: string) => {
    await this.api.retrieveNumberQuery({
      ro: this.store.getCurrentRo(),
      num: tollFreeNumber
    }).pipe(tap(res=>{
      this.numModalNum = res.num;
      this.numModalStatus = res.status;
      this.numModalReservedUntil = res.resUntilDt==undefined?'':res.resUntilDt;
      this.numModalRespOrg = res.ctrlRespOrgId;
      this.numModalEffDate = res.effDt;
      this.numModalLastActive = res.lastActDt==undefined?'':res.lastActDt;
      this.flagNumberOpenModal = true;
    })).toPromise();
  }

  onSearchReserveResultDownload = () => {
    let numsContent = '';
    this.filterNumberList.forEach((item, index) => {
      numsContent += `\n${item.num}, ${item.status}, ${item.message==null?'':item.message}, ${item.suggested_num==null?'':item.suggested_num}`;
    });

    let data = `Type,${this.viewedResult.type}\nSubmitType,${this.viewedResult.submit_type}\nQuantity,${this.viewedResult.total}\nConsecutive,${this.viewedResult.consecutive}\nWildCardNum,${this.viewedResult.wild_card_num==null?'':this.viewedResult.wild_card_num}\nNpa,${this.viewedResult.npa==null?'':this.viewedResult.npa}\nNxx,${this.viewedResult.nxx==null?'':this.viewedResult.nxx}\nLine,${this.viewedResult.line==null?'':this.viewedResult.line}\nSubmit Date Time,${this.viewedResult.sub_dt_tm}\nTotal,${this.viewedResult.failed+this.viewedResult.completed}\nCompleted,${this.viewedResult.completed}\nFailed,${this.viewedResult.failed}\n\nNumber,Status,Message,Suggestions${numsContent}\n`

    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'Search_Reserve_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  onInputNumListFilterKey = () => {
    // this.numbersTable.filterGlobal(this.inputNumListFilterKey.replace(/\W/g, ''), 'contains');
    let omittedPhoneNumber = this.inputNumListFilterKey.replace(/\D/g, '');
    this.filterNumberList = this.numberList.filter(item=>{
      let a = item.num?.includes(omittedPhoneNumber);
      let b = item.status?.includes(this.inputNumListFilterKey);
      let c = item.message?.includes(this.inputNumListFilterKey);
      let d = item.suggested_num?.includes(omittedPhoneNumber);
      if (omittedPhoneNumber=='') {
        return b || c;
      } else {
        return a || b || c || d;
      }
    });
  }

  getStatusTagColor = (result: any): string => {
    let status = this.getStatus(result).toUpperCase();
    switch(status) {
      case 'FAILED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      case 'SUCCESS':
        return 'success';
      default:
        return 'success';
    }
  }

  getCompletedTagColor = (result: any): string => {
    let completed = this.getCompleted(result);
    if(completed==result.total) {
      return 'success';
    } else if(completed==0) {
      return 'danger';
    } else {
      return 'info';
    }
  }

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getData();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1
    this.getData()
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.resultsLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getData();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
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
