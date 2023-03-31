import {Component, OnInit, ViewChild} from '@angular/core';
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
  TIME_REG_EXP, ROWS_PER_PAGE_OPTIONS, SUPER_ADMIN_ROLE_ID, PAGE_NO_PERMISSION_MSG
} from '../../constants';
import { tap } from "rxjs/operators";
import * as gFunc from 'src/app/utils/utils';
import moment from 'moment';
import { Router } from '@angular/router';
import {ConfirmationService, ConfirmEventType, MessageService} from 'primeng/api';
import { PERMISSIONS } from 'src/app/consts/permissions';
import { ROUTES } from 'src/app/app.routes';
import {Table} from "primeng/table";
import {environment} from "../../../../environments/environment";
import {SseClient} from "angular-sse-client";
import { IUser } from 'src/app/models/user';

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
  templates: any[] = [];
  inputTemplate: any;
  inputServiceOrderNum: string = '';
  validSvcOrdrNum: boolean = true;
  timeZones: any[]  = [];
  inputTimeZone = {name: 'Central (C)', value: 'C'}
  inputNumTermLine: string = '';
  validNumTermLine: boolean = true;
  inputEffDate: any = null;
  validEffDate: boolean = true;
  minEffDate: Date = new Date();
  inputNow: boolean = false;
  inputMessage: string = '';

  disableSearch: boolean = false;

  numType: string = OCA_NUM_TYPE_RANDOM;

  pageSize = 10;
  pageIndex = 1
  filterName = ''
  filterValue = ''
  sortActive = 'sub_dt_tm'
  sortDirection = 'DESC'
  resultsLength = -1
  filterResultLength = -1;
  isLoading = true
  rowsPerPageOptions: any = [10,25, 50]

  progressingReq: any[] = [];
  completedReq: any[] = [];

  viewedResult: any;
  csvNumbersContent: string = '';

  activityLogs: any[] = [];
  activityLogsLoading: boolean = false;

  @ViewChild('numbersTable') numbersTable!: Table;

  flagOpenModal: boolean = false;
  numberList: any[] = [];
  filterNumberList: any[] = [];
  inputNumListFilterKey: string = '';
  resultTotal: number = -1;
  numberListLoading: boolean = false;

  isSuperAdmin: boolean = false;
  userOptions: any[] = [];
  selectUser: string|number = '';

  constructor(
    public store: StoreService,
    private sseClient: SseClient,
    private confirmationService: ConfirmationService,
    public api: ApiService,
    public router: Router,
    private messageService: MessageService
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
      if(state.user.permissions?.includes(PERMISSIONS.ONE_CLICK_ACTIVATE)) {
      } else {
        // no permission
        this.showWarn(PAGE_NO_PERMISSION_MSG)
        await new Promise<void>(resolve => { setTimeout(() => { resolve() }, 100) })
        this.router.navigateByUrl(ROUTES.dashboard)
        return
      }

      this.isSuperAdmin = state.user.role_id == SUPER_ADMIN_ROLE_ID;
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

    await this.getTemplate()

    await this.getData();
    this.getUsersList();

    this.sseClient.get(environment.stream_uri+"/"+this.store.getUser().id, { keepAlive: true }).subscribe(data => {
      if(data.page=='OCA') {
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
      }
    })

  }

  getData = async () => {
    this.getTotalCount();

    await this.api.getOcaData(this.sortActive, this.sortDirection, this.pageSize, this.pageIndex, this.filterValue, this.selectUser)
      .pipe(tap(async (res: any[])=>{
        res.map(u => u.sub_dt_tm = u.sub_dt_tm ? moment(new Date(u.sub_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : '');
        this.activityLogs = res;
      })).toPromise();

    this.filterResultLength = -1;
    await this.api.getOcaCount(this.filterValue)
      .pipe(tap( res => {
        this.filterResultLength = res.count
      })).toPromise();
  }

  getTotalCount = async () => {
    this.resultsLength = -1;
    await this.api.getOcaCount('')
      .pipe(tap( res => {
        this.resultsLength = res.count
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

  async getTemplate() {
    await this.api.getTemplateList(this.store.getCurrentRo()!)
      .pipe(tap( res => {
        // this.templates = [ { tmplName:"" }]
        this.templates = this.templates.concat(res)
      })).toPromise();
  }


  onNumFieldFocusOut = () => {

    let num = this.inputNumberMaskEntry;
    if (num !== null && num !== "") {

      let nums = gFunc.retrieveNumListWithHyphen(num)
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
    let lineReg = /\d{1-4}/g

    if (!lineReg.test(line)) {
      if (parseInt(line)>0)
        this.validNumTermLine = true;
      else
        this.validNumTermLine = false;
    } else {
      this.validNumTermLine = false;
    }
  }

  /**
   * this is called when the focus of date field is lost
   */
   onDateFieldFocusOut = () => {
    let effDate = this.inputEffDate;
    if (this.inputNow || effDate !== null)
      this.validEffDate = true;
    else
      this.validEffDate = false;
  }



  onCsvXlUploadAuto = (event: any) => {

  }

  onSearchReserveActivate = () => {
    this.onNumFieldFocusOut()
    this.onNumTermLineFieldFocusOut()
    this.onNXXFieldFocusOut()
    this.onLineFieldFocusOut()
    this.onSvcOrderFieldFocusOut()
    this.onDateFieldFocusOut()

    if (this.invalidNumType != this.gConst.INVALID_NUM_TYPE_NONE)
      return

    if (!this.validQty || !this.validNxx || !this.validLine || !this.validSvcOrdrNum || !this.validNumTermLine || !this.validEffDate)
      return

    if (this.store.getContactInformation()?.name === "" || this.store.getContactInformation()?.number === "") {
      this.showWarn("Please input Contact Information")
      return;
    }

    if (this.inputTemplate==null || this.inputTemplate.tmplName==null) {
      this.showWarn("Please select template")
      return;
    }

    // form is valid
    let body: any = {
      ro: this.store.getCurrentRo(),
      type: this.numType,
      qty: this.input_quantity,
      cons: this.input_consecutive ? "Y" : "N",
      npa: this.inputNpa.value,
      nxx: this.inputNxx,
      line: this.inputLine,
      templateName: this.inputTemplate.tmplName,
      serviceOrder: this.inputServiceOrderNum,
      numTermLine: Number(this.inputNumTermLine),
      timezone: this.inputTimeZone.value,
      contactName: this.store.getContactInformation()?.name,
      contactNumber: this.store.getContactInformation()?.number.replace(/\-/g, ""),
    }

    if (this.numType==this.gConst.OCA_NUM_TYPE_WILDCARD)
      body.wildCardNum = this.inputNumberMaskEntry
    else if (this.numType == this.gConst.OCA_NUM_TYPE_SPECIFIC)
      body.specificNums = this.inputNumberMaskEntry.split(",")

    let effDateTime = ""
    if (this.inputNow)
      effDateTime = "NOW"
    else if (this.inputEffDate!=null) {
      let d = new Date(this.inputEffDate).getTime()
      effDateTime = new Date(Math.ceil(d / 900000) * 900000).toISOString().substring(0, 16) + 'Z'
    }

    body.effDtTm = effDateTime
    console.log(body)

    this.api.submitOca(body).subscribe(res=>{
      if(res.success)
        setTimeout(()=>{
          this.sortActive = 'sub_dt_tm'
          this.sortDirection = 'DESC'
          this.getData();
        }, 100)
    });
  }

  onReset = () => {
    this.inputServiceOrderNum = ""
    this.inputNumTermLine = ""
    this.inputNxx = ""
    this.inputLine = ""
    this.inputNumberMaskEntry = ""
    this.inputEffDate = null

    this.validSvcOrdrNum = true
    this.invalidNumType = this.gConst.INVALID_NUM_TYPE_NONE
    this.validNumTermLine = true
    this.validNxx = true
    this.validLine = true
    this.validEffDate = true
  }

  onOpenViewModal = async (event: Event, result: any) => {
    this.csvNumbersContent = '';
    this.viewedResult = result;

    await this.api.getOcaById(result.id)
      .pipe(tap((response: any[])=>{
        response.map(u => {
          u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '';
          // u.eff_dt_tm = u.eff_dt_tm ? moment(new Date(u.eff_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : ''
        });

        this.numberList = response;
        response.forEach((item, index) => {
          this.csvNumbersContent += `\n${item.num},${item.status},${item.message==null?'':item.message}`;
        });

        this.filterNumberList = this.numberList;
        this.inputNumListFilterKey = '';
        this.onInputNumListFilterKey();
        this.flagOpenModal = true;
        this.resultTotal = this.numberList.length
      })).toPromise();
  }

  onDownloadCsv = async (event: Event, result: any) => {
    let numsContent = '';

    await this.api.getOcaById(result.id).pipe(tap((response: any[])=>{
      response.map(u => {
        u.updated_at = u.updated_at ? moment(new Date(u.updated_at)).format('YYYY/MM/DD h:mm:ss A') : '';
        // u.eff_dt_tm = u.eff_dt_tm ? moment(new Date(u.eff_dt_tm)).format('YYYY/MM/DD h:mm:ss A') : ''
      });

      response.forEach((item, index) => {
        numsContent += `\n${item.num},${item.status},${item.message==null?'':item.message}`;
      });

      let data = `Number,Status,Message${numsContent}\n`
      const csvContent = 'data:text/csv;charset=utf-8,' + data;
      const url = encodeURI(csvContent);
      let fileName = 'OCA_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

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
        this.api.deleteOca(id).subscribe(async res=>{
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

  onInputNumListFilterKey = () => {
    this.numbersTable.filterGlobal(this.inputNumListFilterKey.replace(/\W/g, ''), 'contains');
  }

  closeModal = () => {
    this.flagOpenModal = false;
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

  isProgressing = (result: any) => (this.progressingReq.findIndex(req=>req.req.id==result.id)!=-1 || this.getStatus(result)=='IN PROGRESS');

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

  onSortChange = async (name: any) => {
    this.sortActive = name;
    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 1;
    await this.getData();
  }

  onFilter = (event: Event) => {
    this.pageIndex = 1;
    this.filterName = (event.target as HTMLInputElement).name;
    this.filterValue = (event.target as HTMLInputElement).value;
  }

  onClickFilter = () => {
    this.pageIndex = 1;
    this.getData()
  };

  onPagination = async (pageIndex: any, pageRows: number) => {
    this.pageSize = pageRows;
    const totalPageCount = Math.ceil(this.filterResultLength / this.pageSize);
    if (pageIndex === 0 || pageIndex > totalPageCount) { return; }
    this.pageIndex = pageIndex;
    await this.getData();
  }

  paginate = (event: any) => {
    this.onPagination(event.page+1, event.rows);
  }

  onViewNumbersDownload = () => {
    let data = `Number,Status,Message${this.csvNumbersContent}\n`

    const csvContent = 'data:text/csv;charset=utf-8,' + data;
    const url = encodeURI(csvContent);
    let fileName = 'OCA_Result'+moment(new Date()).format('YYYY_MM_DD_hh_mm_ss');

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
  }

  onEffDateTimeIntervalFifteenMin = () => {
    let d = new Date(this.inputEffDate).getTime();
    this.inputEffDate = new Date(Math.ceil(d / 900000) * 900000);
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
